const Bull = require('bull');
const { getRedisClient } = require('../config/redis');

// Create notification queue
const notificationQueue = new Bull('notification processing', {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
    },
});

// Job types
const JOB_TYPES = {
    DEADLINE_REMINDER: 'deadline_reminder',
    LATE_SUBMISSION_ALERT: 'late_submission_alert',
    COURSE_ASSIGNMENT_NOTIFICATION: 'course_assignment_notification',
    WEEKLY_ACTIVITY_REMINDER: 'weekly_activity_reminder'
};

/**
 * Add a job to the notification queue
 * @param {string} type - Job type
 * @param {object} data - Job data
 * @param {object} options - Job options (delay, repeat, etc.)
 */
const addToQueue = async (type, data, options = {}) => {
    try {
        const job = await notificationQueue.add(type, data, {
            removeOnComplete: 10,
            removeOnFail: 5,
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000,
            },
            ...options
        });

        console.log(`✅ Job ${type} added to queue with ID: ${job.id}`);
        return job;
    } catch (error) {
        console.error(`❌ Failed to add job ${type} to queue:`, error);
        throw error;
    }
};

/**
 * Schedule deadline reminder
 * @param {object} activityData - Activity tracker data
 * @param {Date} reminderTime - When to send the reminder
 */
const scheduleDeadlineReminder = async (activityData, reminderTime = null) => {
    const delay = reminderTime ? reminderTime.getTime() - Date.now() : 24 * 60 * 60 * 1000; // 24 hours before
    
    if (delay <= 0) return; // Don't schedule past reminders

    return addToQueue(JOB_TYPES.DEADLINE_REMINDER, {
        facilitatorId: activityData.facilitatorId,
        courseOfferingId: activityData.courseOfferingId,
        weekNumber: activityData.weekNumber,
        dueDate: activityData.dueDate,
        courseName: activityData.courseName
    }, {
        delay
    });
};

/**
 * Schedule late submission alert
 * @param {object} activityData - Activity tracker data
 */
const scheduleLateSubmissionAlert = async (activityData) => {
    const delay = new Date(activityData.dueDate).getTime() - Date.now() + (60 * 60 * 1000); // 1 hour after due date
    
    if (delay <= 0) return; // Don't schedule past alerts

    return addToQueue(JOB_TYPES.LATE_SUBMISSION_ALERT, {
        facilitatorId: activityData.facilitatorId,
        courseOfferingId: activityData.courseOfferingId,
        weekNumber: activityData.weekNumber,
        dueDate: activityData.dueDate,
        courseName: activityData.courseName,
        managerIds: activityData.managerIds || []
    }, {
        delay
    });
};

/**
 * Send course assignment notification
 * @param {object} assignmentData - Course assignment data
 */
const sendCourseAssignmentNotification = async (assignmentData) => {
    return addToQueue(JOB_TYPES.COURSE_ASSIGNMENT_NOTIFICATION, {
        facilitatorId: assignmentData.facilitatorId,
        courseId: assignmentData.courseId,
        courseName: assignmentData.courseName,
        cohortName: assignmentData.cohortName,
        startDate: assignmentData.startDate
    });
};

/**
 * Schedule weekly activity reminders
 * Every Friday at 10 AM to remind facilitators to submit their weekly logs
 */
const scheduleWeeklyReminders = async () => {
    return addToQueue(JOB_TYPES.WEEKLY_ACTIVITY_REMINDER, {
        message: 'Weekly activity log reminder'
    }, {
        repeat: { cron: '0 10 * * 5' } // Every Friday at 10 AM
    });
};

/**
 * Get queue stats
 */
const getQueueStats = async () => {
    try {
        const waiting = await notificationQueue.getWaiting();
        const active = await notificationQueue.getActive();
        const completed = await notificationQueue.getCompleted();
        const failed = await notificationQueue.getFailed();
        const delayed = await notificationQueue.getDelayed();

        return {
            waiting: waiting.length,
            active: active.length,
            completed: completed.length,
            failed: failed.length,
            delayed: delayed.length
        };
    } catch (error) {
        console.error('Error getting queue stats:', error);
        return null;
    }
};

/**
 * Clean old jobs
 */
const cleanQueue = async () => {
    try {
        await notificationQueue.clean(24 * 60 * 60 * 1000, 'completed'); // Remove completed jobs older than 24 hours
        await notificationQueue.clean(7 * 24 * 60 * 60 * 1000, 'failed'); // Remove failed jobs older than 7 days
        console.log('✅ Queue cleaned successfully');
    } catch (error) {
        console.error('❌ Error cleaning queue:', error);
    }
};

module.exports = {
    notificationQueue,
    JOB_TYPES,
    addToQueue,
    scheduleDeadlineReminder,
    scheduleLateSubmissionAlert,
    sendCourseAssignmentNotification,
    scheduleWeeklyReminders,
    getQueueStats,
    cleanQueue
};
