const { Course } = require('../../src/models');
const { sequelize } = require('../../src/config/database');

describe('Course Model', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    beforeEach(async () => {
        await Course.destroy({ where: {} });
    });

    describe('Course Creation', () => {
        it('should create a course with valid data', async () => {
            const courseData = {
                code: 'CS101',
                name: 'Introduction to Computer Science',
                description: 'Basic computer science concepts',
                credits: 3
            };

            const course = await Course.create(courseData);

            expect(course.id).toBeDefined();
            expect(course.code).toBe(courseData.code);
            expect(course.name).toBe(courseData.name);
            expect(course.description).toBe(courseData.description);
            expect(course.credits).toBe(courseData.credits);
            expect(course.isActive).toBe(true);
        });

        it('should throw error for missing required fields', async () => {
            const courseData = {
                name: 'Introduction to Computer Science',
                credits: 3
                // Missing code
            };

            await expect(Course.create(courseData)).rejects.toThrow();
        });

        it('should throw error for duplicate course code', async () => {
            const courseData = {
                code: 'CS101',
                name: 'Introduction to Computer Science',
                credits: 3
            };

            await Course.create(courseData);
            await expect(Course.create(courseData)).rejects.toThrow();
        });

        it('should throw error for invalid credits', async () => {
            const courseData = {
                code: 'CS101',
                name: 'Introduction to Computer Science',
                credits: 15 // Too many credits (max is 10)
            };

            await expect(Course.create(courseData)).rejects.toThrow();
        });

        it('should throw error for short course code', async () => {
            const courseData = {
                code: 'CS',
                name: 'Introduction to Computer Science',
                credits: 3
            };

            await expect(Course.create(courseData)).rejects.toThrow();
        });

        it('should throw error for short course name', async () => {
            const courseData = {
                code: 'CS101',
                name: 'CS',
                credits: 3
            };

            await expect(Course.create(courseData)).rejects.toThrow();
        });
    });

    describe('Course Updates', () => {
        let course;

        beforeEach(async () => {
            course = await Course.create({
                code: 'CS101',
                name: 'Introduction to Computer Science',
                description: 'Basic computer science concepts',
                credits: 3
            });
        });

        it('should update course fields', async () => {
            await course.update({ 
                name: 'Advanced Computer Science',
                credits: 4
            });

            expect(course.name).toBe('Advanced Computer Science');
            expect(course.credits).toBe(4);
        });

        it('should soft delete course by setting isActive to false', async () => {
            await course.update({ isActive: false });
            expect(course.isActive).toBe(false);
        });
    });

    describe('Course Queries', () => {
        beforeEach(async () => {
            await Course.bulkCreate([
                {
                    code: 'CS101',
                    name: 'Introduction to Computer Science',
                    credits: 3,
                    isActive: true
                },
                {
                    code: 'CS102',
                    name: 'Data Structures',
                    credits: 4,
                    isActive: true
                },
                {
                    code: 'CS103',
                    name: 'Algorithms',
                    credits: 4,
                    isActive: false
                }
            ]);
        });

        it('should find all active courses', async () => {
            const courses = await Course.findAll({
                where: { isActive: true }
            });

            expect(courses).toHaveLength(2);
            expect(courses.every(course => course.isActive)).toBe(true);
        });

        it('should find course by code', async () => {
            const course = await Course.findOne({
                where: { code: 'CS101' }
            });

            expect(course).toBeDefined();
            expect(course.code).toBe('CS101');
            expect(course.name).toBe('Introduction to Computer Science');
        });

        it('should find courses by credits', async () => {
            const courses = await Course.findAll({
                where: { credits: 4, isActive: true }
            });

            expect(courses).toHaveLength(1);
            expect(courses[0].code).toBe('CS102');
        });
    });

    describe('Course Validation', () => {
        it('should validate minimum credits', async () => {
            const courseData = {
                code: 'CS101',
                name: 'Introduction to Computer Science',
                credits: 0
            };

            await expect(Course.create(courseData)).rejects.toThrow();
        });

        it('should validate maximum credits', async () => {
            const courseData = {
                code: 'CS101',
                name: 'Introduction to Computer Science',
                credits: 11
            };

            await expect(Course.create(courseData)).rejects.toThrow();
        });

        it('should accept valid credits range', async () => {
            const validCredits = [1, 3, 5, 10];

            for (const credits of validCredits) {
                const courseData = {
                    code: `CS${credits}01`,
                    name: `Course with ${credits} credits`,
                    credits
                };

                const course = await Course.create(courseData);
                expect(course.credits).toBe(credits);
            }
        });
    });

    describe('Course Prerequisites', () => {
        it('should handle course prerequisites as JSON', async () => {
            const courseData = {
                code: 'CS201',
                name: 'Advanced Programming',
                credits: 4,
                prerequisites: [1, 2] // Array of course IDs
            };

            const course = await Course.create(courseData);
            expect(course.prerequisites).toEqual([1, 2]);
        });

        it('should handle null prerequisites', async () => {
            const courseData = {
                code: 'CS101',
                name: 'Introduction to Computer Science',
                credits: 3,
                prerequisites: null
            };

            const course = await Course.create(courseData);
            expect(course.prerequisites).toBeNull();
        });
    });
});
