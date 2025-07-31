const { notificationQueue, JOB_TYPES } = require('../services/notificationService');
const { 
    sendDeadlineReminderEmail, 
    sendLateSubmissionAlert, 
    sendCourseAssignmentNotification,
    sendWeeklyActivityReminder 
} = require('../services/emailService');
const { User, ActivityTracker, CourseOffering, Course } = require('../models');

// Process notification jobs
notificationQueue.process(async (job) => {
    const { type, data } = job;
    
    console.log(`🔄 Processing job: ${type} with ID: ${job.id}`);
    
    try {
        switch (type) {
            case JOB_TYPES.DEADLINE_REMINDER:
                await processDeadlineReminder(data);
                break;
                
            case JOB_TYPES.LATE_SUBMISSION_ALERT:
                await processLateSubmissionAlert(data);
                break;
                
            case JOB_TYPES.COURSE_ASSIGNMENT_NOTIFICATION:
                await processCourseAssignmentNotification(data);
                break;
                
            case JOB_TYPES.WEEKLY_ACTIVITY_REMINDER:
                await processWeeklyActivityReminder(data);
                break;
                
            default:
                console.warn(`⚠️ Unknown job type: ${type}`);
        }
        
        console.log(`✅ Job ${type} completed successfully`);
    } catch (error) {
        console.error(`❌ Job ${type} failed:`, error);
        throw error; // Re-throw to mark job as failed
    }
});

/**
 * Process deadline reminder job
 */
const processDeadlineReminder = async (data) => {
    const { facilitatorId, courseOfferingId, weekNumber, dueDate } = data;
    
    // Check if activity has already been submitted
    const activity = await ActivityTracker.findOne({
        where: {
            facilitatorId,
            courseOfferingId,
            weekNumber
        }
    });
    
    // Don't send reminder if already submitted
    if (activity && activity.status === 'submitted') {
        console.log(`📝 Activity already submitted for facilitator ${facilitatorId}, week ${weekNumber}`);
        return;
    }
    
    // Get facilitator details
    const facilitator = await User.findByPk(facilitatorId);
    if (!facilitator) {
        throw new Error(`Facilitator with ID ${facilitatorId} not found`);
    }
    
    // Get course details
    const courseOffering = await CourseOffering.findByPk(courseOfferingId, {
        include: [{ model: Course, as: 'course' }]
    });
    
    if (!courseOffering) {
        throw new Error(`Course offering with ID ${courseOfferingId} not found`);
    }
    
    const reminderData = {
        ...data,
        courseName: courseOffering.course.name
    };
    
    await sendDeadlineReminderEmail(facilitator, reminderData);
};

/**
 * Process late submission alert job
 */
const processLateSubmissionAlert = async (data) => {
    const { facilitatorId, courseOfferingId, weekNumber } = data;
    
    // Check if activity has been submitted
    const activity = await ActivityTracker.findOne({
        where: {
            facilitatorId,
            courseOfferingId,
            weekNumber
        }
    });
    
    // Don't send alert if submitted
    if (activity && activity.status === 'submitted') {
        console.log(`📝 Activity was submitted for facilitator ${facilitatorId}, week ${weekNumber}`);
        return;
    }
    
    // Mark activity as late or missed if it exists
    if (activity) {
        await activity.update({ status: 'late' });
    }
    
    // Get facilitator details
    const facilitator = await User.findByPk(facilitatorId);
    if (!facilitator) {
        throw new Error(`Facilitator with ID ${facilitatorId} not found`);
    }
    
    // Get course details
    const courseOffering = await CourseOffering.findByPk(courseOfferingId, {
        include: [{ model: Course, as: 'course' }]
    });
    
    if (!courseOffering) {
        throw new Error(`Course offering with ID ${courseOfferingId} not found`);
    }
    
    // Get all managers
    const managers = await User.findAll({
        where: { role: 'manager', isActive: true }
    });
    
    const alertData = {
        ...data,
        courseName: courseOffering.course.name
    };
    
    await sendLateSubmissionAlert(managers, facilitator, alertData);
};

/**
 * Process course assignment notification job
 */
const processCourseAssignmentNotification = async (data) => {
    const { facilitatorId } = data;
    
    // Get facilitator details
    const facilitator = await User.findByPk(facilitatorId);
    if (!facilitator) {
        throw new Error(`Facilitator with ID ${facilitatorId} not found`);
    }
    
    await sendCourseAssignmentNotification(facilitator, data);
};

/**
 * Process weekly activity reminder job
 */
const processWeeklyActivityReminder = async (data) => {
    // Get all active facilitators
    const facilitators = await User.findAll({
        where: { 
            role: 'facilitator', 
            isActive: true 
        }
    });
    
    if (facilitators.length === 0) {
        console.log('📭 No active facilitators found');
        return;
    }
    
    await sendWeeklyActivityReminder(facilitators);
};

// Queue event listeners
notificationQueue.on('completed', (job) => {
    console.log(`✅ Job ${job.id} of type ${job.data.type} completed`);
});

notificationQueue.on('failed', (job, err) => {
    console.error(`❌ Job ${job.id} of type ${job.data.type} failed:`, err.message);
});

notificationQueue.on('stalled', (job) => {
    console.warn(`⏸️ Job ${job.id} of type ${job.data.type} stalled`);
});

notificationQueue.on('progress', (job, progress) => {
    console.log(`🔄 Job ${job.id} is ${progress}% complete`);
});

console.log('🚀 Notification worker started and listening for jobs...');

module.exports = notificationQueue;
