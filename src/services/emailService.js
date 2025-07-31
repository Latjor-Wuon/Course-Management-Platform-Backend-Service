const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

/**
 * Send deadline reminder email
 * @param {object} facilitator - Facilitator user object
 * @param {object} data - Reminder data
 */
const sendDeadlineReminderEmail = async (facilitator, data) => {
    const transporter = createTransporter();
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: facilitator.email,
        subject: '📅 Activity Log Deadline Reminder',
        html: `
            <h2>Activity Log Deadline Reminder</h2>
            <p>Hello ${facilitator.firstName},</p>
            <p>This is a friendly reminder that your activity log for <strong>${data.courseName}</strong> (Week ${data.weekNumber}) is due soon.</p>
            <p><strong>Due Date:</strong> ${new Date(data.dueDate).toLocaleDateString()}</p>
            <p>Please log into the system to submit your weekly activities.</p>
            <p>Best regards,<br>Course Management System</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Deadline reminder email sent to ${facilitator.email}`);
    } catch (error) {
        console.error(`❌ Failed to send deadline reminder email to ${facilitator.email}:`, error);
        throw error;
    }
};

/**
 * Send late submission alert email to managers
 * @param {Array} managers - Array of manager user objects
 * @param {object} facilitator - Facilitator user object
 * @param {object} data - Alert data
 */
const sendLateSubmissionAlert = async (managers, facilitator, data) => {
    const transporter = createTransporter();
    
    const managerEmails = managers.map(manager => manager.email);
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: managerEmails,
        subject: '⚠️ Late Activity Log Submission Alert',
        html: `
            <h2>Late Activity Log Submission Alert</h2>
            <p>This is an automated alert regarding a late activity log submission.</p>
            <p><strong>Facilitator:</strong> ${facilitator.firstName} ${facilitator.lastName} (${facilitator.email})</p>
            <p><strong>Course:</strong> ${data.courseName}</p>
            <p><strong>Week Number:</strong> ${data.weekNumber}</p>
            <p><strong>Due Date:</strong> ${new Date(data.dueDate).toLocaleDateString()}</p>
            <p>The activity log for the above course has not been submitted by the deadline. Please follow up with the facilitator as needed.</p>
            <p>Best regards,<br>Course Management System</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Late submission alert sent to ${managerEmails.join(', ')}`);
    } catch (error) {
        console.error(`❌ Failed to send late submission alert:`, error);
        throw error;
    }
};

/**
 * Send course assignment notification
 * @param {object} facilitator - Facilitator user object
 * @param {object} data - Assignment data
 */
const sendCourseAssignmentNotification = async (facilitator, data) => {
    const transporter = createTransporter();
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: facilitator.email,
        subject: '🎓 New Course Assignment',
        html: `
            <h2>New Course Assignment</h2>
            <p>Hello ${facilitator.firstName},</p>
            <p>You have been assigned to facilitate a new course:</p>
            <p><strong>Course:</strong> ${data.courseName}</p>
            <p><strong>Cohort:</strong> ${data.cohortName}</p>
            <p><strong>Start Date:</strong> ${new Date(data.startDate).toLocaleDateString()}</p>
            <p>Please log into the system to view more details about your assignment.</p>
            <p>Best regards,<br>Course Management System</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Course assignment notification sent to ${facilitator.email}`);
    } catch (error) {
        console.error(`❌ Failed to send course assignment notification to ${facilitator.email}:`, error);
        throw error;
    }
};

/**
 * Send weekly activity reminder to all facilitators
 * @param {Array} facilitators - Array of facilitator user objects
 */
const sendWeeklyActivityReminder = async (facilitators) => {
    const transporter = createTransporter();
    
    for (const facilitator of facilitators) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: facilitator.email,
            subject: '📊 Weekly Activity Log Reminder',
            html: `
                <h2>Weekly Activity Log Reminder</h2>
                <p>Hello ${facilitator.firstName},</p>
                <p>This is your weekly reminder to submit activity logs for all your assigned courses.</p>
                <p>Please ensure that you log all activities for the current week by the deadline.</p>
                <p>Log into the system to submit your weekly activities.</p>
                <p>Best regards,<br>Course Management System</p>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`✅ Weekly reminder sent to ${facilitator.email}`);
        } catch (error) {
            console.error(`❌ Failed to send weekly reminder to ${facilitator.email}:`, error);
        }
    }
};

module.exports = {
    sendDeadlineReminderEmail,
    sendLateSubmissionAlert,
    sendCourseAssignmentNotification,
    sendWeeklyActivityReminder
};
