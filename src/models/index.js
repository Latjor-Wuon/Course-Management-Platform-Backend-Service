const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = require('./User');
const Course = require('./Course');
const Cohort = require('./Cohort');
const Class = require('./Class');
const Student = require('./Student');
const CourseOffering = require('./CourseOffering');
const ActivityTracker = require('./ActivityTracker');
const Mode = require('./Mode');

// User associations
User.hasMany(Student, { foreignKey: 'userId', as: 'studentProfile' });
Student.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(CourseOffering, { foreignKey: 'facilitatorId', as: 'facilitatedCourses' });
CourseOffering.belongsTo(User, { foreignKey: 'facilitatorId', as: 'facilitator' });

User.hasMany(ActivityTracker, { foreignKey: 'facilitatorId', as: 'activityLogs' });
ActivityTracker.belongsTo(User, { foreignKey: 'facilitatorId', as: 'facilitator' });

// Course associations
Course.hasMany(CourseOffering, { foreignKey: 'courseId', as: 'offerings' });
CourseOffering.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Cohort associations
Cohort.hasMany(Student, { foreignKey: 'cohortId', as: 'students' });
Student.belongsTo(Cohort, { foreignKey: 'cohortId', as: 'cohort' });

Cohort.hasMany(CourseOffering, { foreignKey: 'cohortId', as: 'courseOfferings' });
CourseOffering.belongsTo(Cohort, { foreignKey: 'cohortId', as: 'cohort' });

// Class associations
Class.hasMany(CourseOffering, { foreignKey: 'classId', as: 'courseOfferings' });
CourseOffering.belongsTo(Class, { foreignKey: 'classId', as: 'class' });

// Mode associations
Mode.hasMany(CourseOffering, { foreignKey: 'modeId', as: 'courseOfferings' });
CourseOffering.belongsTo(Mode, { foreignKey: 'modeId', as: 'mode' });

// CourseOffering associations
CourseOffering.hasMany(ActivityTracker, { foreignKey: 'courseOfferingId', as: 'activityTrackers' });
ActivityTracker.belongsTo(CourseOffering, { foreignKey: 'courseOfferingId', as: 'courseOffering' });

// Student enrollment (many-to-many through junction table)
const StudentEnrollment = sequelize.define('StudentEnrollment', {
    enrollmentDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    status: {
        type: DataTypes.ENUM('enrolled', 'dropped', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'enrolled',
    },
    grade: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    finalScore: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        validate: {
            min: 0,
            max: 100,
        },
    },
});

Student.belongsToMany(CourseOffering, { 
    through: StudentEnrollment, 
    foreignKey: 'studentId',
    as: 'enrolledCourses'
});

CourseOffering.belongsToMany(Student, { 
    through: StudentEnrollment, 
    foreignKey: 'courseOfferingId',
    as: 'enrolledStudents'
});

module.exports = {
    User,
    Course,
    Cohort,
    Class,
    Student,
    CourseOffering,
    ActivityTracker,
    Mode,
    StudentEnrollment,
};
