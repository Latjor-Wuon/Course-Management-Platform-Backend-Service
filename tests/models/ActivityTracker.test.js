const { ActivityTracker, User, Course, CourseOffering, Cohort, Mode } = require('../../src/models');
const { sequelize } = require('../../src/config/database');

describe('ActivityTracker Model', () => {
    let facilitator, course, cohort, mode, courseOffering;

    beforeAll(async () => {
        await sequelize.sync({ force: true });

        // Create test data
        facilitator = await User.create({
            email: 'facilitator@test.com',
            password: 'password123',
            firstName: 'John',
            lastName: 'Facilitator',
            role: 'facilitator'
        });

        course = await Course.create({
            code: 'CS101',
            name: 'Introduction to Computer Science',
            credits: 3
        });

        cohort = await Cohort.create({
            name: 'Fall 2025 Cohort',
            startDate: '2025-09-01',
            endDate: '2025-12-15',
            trimester: 'Fall',
            year: 2025
        });

        mode = await Mode.create({
            name: 'Online'
        });

        courseOffering = await CourseOffering.create({
            courseId: course.id,
            cohortId: cohort.id,
            facilitatorId: facilitator.id,
            modeId: mode.id,
            startDate: '2025-09-01',
            endDate: '2025-12-15'
        });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    beforeEach(async () => {
        await ActivityTracker.destroy({ where: {} });
    });

    describe('ActivityTracker Creation', () => {
        it('should create an activity tracker with valid data', async () => {
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 7);

            const activityData = {
                courseOfferingId: courseOffering.id,
                facilitatorId: facilitator.id,
                weekNumber: 1,
                activities: [
                    {
                        topic: 'Introduction to Programming',
                        duration: 120,
                        type: 'lecture'
                    }
                ],
                dueDate,
                notes: 'First week activities',
                attendanceCount: 25
            };

            const activity = await ActivityTracker.create(activityData);

            expect(activity.id).toBeDefined();
            expect(activity.courseOfferingId).toBe(courseOffering.id);
            expect(activity.facilitatorId).toBe(facilitator.id);
            expect(activity.weekNumber).toBe(1);
            expect(activity.activities).toEqual(activityData.activities);
            expect(activity.status).toBe('pending');
            expect(activity.notes).toBe(activityData.notes);
            expect(activity.attendanceCount).toBe(25);
        });

        it('should throw error for missing required fields', async () => {
            const activityData = {
                courseOfferingId: courseOffering.id,
                facilitatorId: facilitator.id
                // Missing weekNumber and dueDate
            };

            await expect(ActivityTracker.create(activityData)).rejects.toThrow();
        });

        it('should throw error for invalid week number', async () => {
            const activityData = {
                courseOfferingId: courseOffering.id,
                facilitatorId: facilitator.id,
                weekNumber: 0, // Invalid week number
                dueDate: new Date()
            };

            await expect(ActivityTracker.create(activityData)).rejects.toThrow();
        });

        it('should throw error for week number too high', async () => {
            const activityData = {
                courseOfferingId: courseOffering.id,
                facilitatorId: facilitator.id,
                weekNumber: 53, // Invalid week number
                dueDate: new Date()
            };

            await expect(ActivityTracker.create(activityData)).rejects.toThrow();
        });

        it('should prevent duplicate entries for same course, facilitator, and week', async () => {
            const dueDate = new Date();
            const activityData = {
                courseOfferingId: courseOffering.id,
                facilitatorId: facilitator.id,
                weekNumber: 1,
                dueDate
            };

            await ActivityTracker.create(activityData);
            await expect(ActivityTracker.create(activityData)).rejects.toThrow();
        });
    });

    describe('ActivityTracker Status', () => {
        let activity;

        beforeEach(async () => {
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 7);

            activity = await ActivityTracker.create({
                courseOfferingId: courseOffering.id,
                facilitatorId: facilitator.id,
                weekNumber: 1,
                dueDate
            });
        });

        it('should default to pending status', () => {
            expect(activity.status).toBe('pending');
        });

        it('should update status to submitted', async () => {
            await activity.update({ 
                status: 'submitted',
                submittedAt: new Date()
            });

            expect(activity.status).toBe('submitted');
            expect(activity.submittedAt).toBeDefined();
        });

        it('should update status to late', async () => {
            await activity.update({ status: 'late' });
            expect(activity.status).toBe('late');
        });

        it('should update status to missed', async () => {
            await activity.update({ status: 'missed' });
            expect(activity.status).toBe('missed');
        });
    });

    describe('ActivityTracker Activities', () => {
        let activity;

        beforeEach(async () => {
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 7);

            activity = await ActivityTracker.create({
                courseOfferingId: courseOffering.id,
                facilitatorId: facilitator.id,
                weekNumber: 1,
                dueDate
            });
        });

        it('should store activities as JSON', async () => {
            const activities = [
                {
                    topic: 'Variables and Data Types',
                    duration: 90,
                    type: 'lecture',
                    objectives: ['Understand variables', 'Learn data types']
                },
                {
                    topic: 'Hands-on Programming',
                    duration: 60,
                    type: 'lab',
                    tools: ['IDE', 'Compiler']
                }
            ];

            await activity.update({ activities });
            expect(activity.activities).toEqual(activities);
        });

        it('should handle null activities', async () => {
            await activity.update({ activities: null });
            expect(activity.activities).toBeNull();
        });

        it('should handle empty activities array', async () => {
            await activity.update({ activities: [] });
            expect(activity.activities).toEqual([]);
        });
    });

    describe('ActivityTracker Associations', () => {
        let activity;

        beforeEach(async () => {
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 7);

            activity = await ActivityTracker.create({
                courseOfferingId: courseOffering.id,
                facilitatorId: facilitator.id,
                weekNumber: 1,
                dueDate
            });
        });

        it('should load facilitator association', async () => {
            const activityWithFacilitator = await ActivityTracker.findByPk(activity.id, {
                include: [{ model: User, as: 'facilitator' }]
            });

            expect(activityWithFacilitator.facilitator).toBeDefined();
            expect(activityWithFacilitator.facilitator.id).toBe(facilitator.id);
            expect(activityWithFacilitator.facilitator.role).toBe('facilitator');
        });

        it('should load course offering association', async () => {
            const activityWithCourseOffering = await ActivityTracker.findByPk(activity.id, {
                include: [{ model: CourseOffering, as: 'courseOffering' }]
            });

            expect(activityWithCourseOffering.courseOffering).toBeDefined();
            expect(activityWithCourseOffering.courseOffering.id).toBe(courseOffering.id);
        });

        it('should load nested associations', async () => {
            const activityWithAll = await ActivityTracker.findByPk(activity.id, {
                include: [
                    { 
                        model: User, 
                        as: 'facilitator',
                        attributes: ['id', 'firstName', 'lastName']
                    },
                    {
                        model: CourseOffering,
                        as: 'courseOffering',
                        include: [
                            { model: Course, as: 'course' },
                            { model: Cohort, as: 'cohort' }
                        ]
                    }
                ]
            });

            expect(activityWithAll.facilitator).toBeDefined();
            expect(activityWithAll.courseOffering).toBeDefined();
            expect(activityWithAll.courseOffering.course).toBeDefined();
            expect(activityWithAll.courseOffering.cohort).toBeDefined();
        });
    });

    describe('ActivityTracker Queries', () => {
        beforeEach(async () => {
            const today = new Date();
            
            // Create multiple activity trackers
            await ActivityTracker.bulkCreate([
                {
                    courseOfferingId: courseOffering.id,
                    facilitatorId: facilitator.id,
                    weekNumber: 1,
                    status: 'submitted',
                    dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
                    submittedAt: today
                },
                {
                    courseOfferingId: courseOffering.id,
                    facilitatorId: facilitator.id,
                    weekNumber: 2,
                    status: 'pending',
                    dueDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000)
                },
                {
                    courseOfferingId: courseOffering.id,
                    facilitatorId: facilitator.id,
                    weekNumber: 3,
                    status: 'late',
                    dueDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)
                }
            ]);
        });

        it('should find activities by status', async () => {
            const submittedActivities = await ActivityTracker.findAll({
                where: { status: 'submitted' }
            });

            const pendingActivities = await ActivityTracker.findAll({
                where: { status: 'pending' }
            });

            expect(submittedActivities).toHaveLength(1);
            expect(pendingActivities).toHaveLength(1);
        });

        it('should find activities by facilitator', async () => {
            const facilitatorActivities = await ActivityTracker.findAll({
                where: { facilitatorId: facilitator.id }
            });

            expect(facilitatorActivities).toHaveLength(3);
        });

        it('should find activities by week number', async () => {
            const week1Activities = await ActivityTracker.findAll({
                where: { weekNumber: 1 }
            });

            expect(week1Activities).toHaveLength(1);
            expect(week1Activities[0].status).toBe('submitted');
        });

        it('should order activities by week number', async () => {
            const activities = await ActivityTracker.findAll({
                order: [['weekNumber', 'ASC']]
            });

            expect(activities).toHaveLength(3);
            expect(activities[0].weekNumber).toBe(1);
            expect(activities[1].weekNumber).toBe(2);
            expect(activities[2].weekNumber).toBe(3);
        });
    });
});
