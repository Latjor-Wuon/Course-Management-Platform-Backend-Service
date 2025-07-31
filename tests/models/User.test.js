const { User } = require('../../src/models');
const { sequelize } = require('../../src/config/database');
const bcrypt = require('bcryptjs');

describe('User Model', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    beforeEach(async () => {
        await User.destroy({ where: {} });
    });

    describe('User Creation', () => {
        it('should create a user with valid data', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe',
                role: 'student'
            };

            const user = await User.create(userData);

            expect(user.id).toBeDefined();
            expect(user.email).toBe(userData.email);
            expect(user.firstName).toBe(userData.firstName);
            expect(user.lastName).toBe(userData.lastName);
            expect(user.role).toBe(userData.role);
            expect(user.isActive).toBe(true);
            expect(user.password).not.toBe(userData.password); // Password should be hashed
        });

        it('should hash password before saving', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe',
                role: 'student'
            };

            const user = await User.create(userData);
            const isValidPassword = await bcrypt.compare(userData.password, user.password);

            expect(isValidPassword).toBe(true);
        });

        it('should throw error for invalid email', async () => {
            const userData = {
                email: 'invalid-email',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe',
                role: 'student'
            };

            await expect(User.create(userData)).rejects.toThrow();
        });

        it('should throw error for invalid role', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe',
                role: 'invalid-role'
            };

            await expect(User.create(userData)).rejects.toThrow();
        });

        it('should throw error for duplicate email', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe',
                role: 'student'
            };

            await User.create(userData);
            await expect(User.create(userData)).rejects.toThrow();
        });

        it('should throw error for short password', async () => {
            const userData = {
                email: 'test@example.com',
                password: '123',
                firstName: 'John',
                lastName: 'Doe',
                role: 'student'
            };

            await expect(User.create(userData)).rejects.toThrow();
        });
    });

    describe('User Methods', () => {
        let user;

        beforeEach(async () => {
            user = await User.create({
                email: 'test@example.com',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe',
                role: 'student'
            });
        });

        it('should validate correct password', async () => {
            const isValid = await user.validatePassword('password123');
            expect(isValid).toBe(true);
        });

        it('should reject incorrect password', async () => {
            const isValid = await user.validatePassword('wrongpassword');
            expect(isValid).toBe(false);
        });

        it('should return full name', () => {
            const fullName = user.getFullName();
            expect(fullName).toBe('John Doe');
        });
    });

    describe('User Scopes', () => {
        beforeEach(async () => {
            await User.create({
                email: 'test@example.com',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe',
                role: 'student'
            });
        });

        it('should exclude password by default', async () => {
            const user = await User.findOne({ where: { email: 'test@example.com' } });
            expect(user.password).toBeUndefined();
        });

        it('should include password with withPassword scope', async () => {
            const user = await User.scope('withPassword').findOne({ 
                where: { email: 'test@example.com' } 
            });
            expect(user.password).toBeDefined();
        });
    });

    describe('User Updates', () => {
        let user;

        beforeEach(async () => {
            user = await User.create({
                email: 'test@example.com',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe',
                role: 'student'
            });
        });

        it('should update user fields', async () => {
            await user.update({ firstName: 'Jane' });
            expect(user.firstName).toBe('Jane');
        });

        it('should hash new password on update', async () => {
            const originalPassword = user.password;
            await user.update({ password: 'newpassword123' });
            
            expect(user.password).not.toBe(originalPassword);
            expect(user.password).not.toBe('newpassword123');
            
            const isValid = await user.validatePassword('newpassword123');
            expect(isValid).toBe(true);
        });
    });
});
