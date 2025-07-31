const { generateToken, authenticate } = require('../../src/middleware/auth');
const { User } = require('../../src/models');
const { sequelize } = require('../../src/config/database');
const jwt = require('jsonwebtoken');

// Mock request and response objects
const mockRequest = (headers = {}) => ({
    headers,
    user: null
});

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext = jest.fn();

// Mock translation function
const mockT = jest.fn((key) => key);

describe('Authentication Utilities', () => {
    let user;

    beforeAll(async () => {
        await sequelize.sync({ force: true });
        
        user = await User.create({
            email: 'test@example.com',
            password: 'password123',
            firstName: 'John',
            lastName: 'Doe',
            role: 'student'
        });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockNext.mockClear();
    });

    describe('generateToken', () => {
        it('should generate a valid JWT token', () => {
            const token = generateToken(user);

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            expect(decoded.userId).toBe(user.id);
            expect(decoded.role).toBe(user.role);
            expect(decoded.email).toBe(user.email);
        });

        it('should include expiration time', () => {
            const token = generateToken(user);
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            expect(decoded.exp).toBeDefined();
            expect(decoded.iat).toBeDefined();
            expect(decoded.exp).toBeGreaterThan(decoded.iat);
        });

        it('should generate different tokens for different users', async () => {
            const user2 = await User.create({
                email: 'user2@example.com',
                password: 'password123',
                firstName: 'Jane',
                lastName: 'Smith',
                role: 'facilitator'
            });

            const token1 = generateToken(user);
            const token2 = generateToken(user2);

            expect(token1).not.toBe(token2);

            const decoded1 = jwt.verify(token1, process.env.JWT_SECRET);
            const decoded2 = jwt.verify(token2, process.env.JWT_SECRET);

            expect(decoded1.userId).not.toBe(decoded2.userId);
            expect(decoded1.role).not.toBe(decoded2.role);
        });
    });

    describe('authenticate middleware', () => {
        it('should authenticate user with valid token', async () => {
            const token = generateToken(user);
            const req = mockRequest({
                authorization: `Bearer ${token}`
            });
            req.t = mockT;
            const res = mockResponse();

            await authenticate(req, res, mockNext);

            expect(req.user).toBeDefined();
            expect(req.user.id).toBe(user.id);
            expect(req.user.email).toBe(user.email);
            expect(mockNext).toHaveBeenCalledWith();
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should reject request without authorization header', async () => {
            const req = mockRequest();
            req.t = mockT;
            const res = mockResponse();

            await authenticate(req, res, mockNext);

            expect(req.user).toBeNull();
            expect(mockNext).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'auth.unauthorized'
            });
        });

        it('should reject request with malformed authorization header', async () => {
            const req = mockRequest({
                authorization: 'InvalidHeader'
            });
            req.t = mockT;
            const res = mockResponse();

            await authenticate(req, res, mockNext);

            expect(req.user).toBeNull();
            expect(mockNext).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('should reject request with invalid token', async () => {
            const req = mockRequest({
                authorization: 'Bearer invalid_token'
            });
            req.t = mockT;
            const res = mockResponse();

            await authenticate(req, res, mockNext);

            expect(req.user).toBeNull();
            expect(mockNext).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('should reject request with expired token', async () => {
            const expiredToken = jwt.sign(
                { userId: user.id, role: user.role, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '-1s' } // Expired 1 second ago
            );

            const req = mockRequest({
                authorization: `Bearer ${expiredToken}`
            });
            req.t = mockT;
            const res = mockResponse();

            await authenticate(req, res, mockNext);

            expect(req.user).toBeNull();
            expect(mockNext).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'auth.token_expired'
            });
        });

        it('should reject request for inactive user', async () => {
            // Deactivate user
            await user.update({ isActive: false });

            const token = generateToken(user);
            const req = mockRequest({
                authorization: `Bearer ${token}`
            });
            req.t = mockT;
            const res = mockResponse();

            await authenticate(req, res, mockNext);

            expect(req.user).toBeNull();
            expect(mockNext).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);

            // Reactivate user for other tests
            await user.update({ isActive: true });
        });

        it('should reject request for non-existent user', async () => {
            const fakeUserId = 99999;
            const fakeToken = jwt.sign(
                { userId: fakeUserId, role: 'student', email: 'fake@example.com' },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            const req = mockRequest({
                authorization: `Bearer ${fakeToken}`
            });
            req.t = mockT;
            const res = mockResponse();

            await authenticate(req, res, mockNext);

            expect(req.user).toBeNull();
            expect(mockNext).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('should handle database errors gracefully', async () => {
            const token = generateToken(user);
            const req = mockRequest({
                authorization: `Bearer ${token}`
            });
            req.t = mockT;
            const res = mockResponse();

            // Mock User.findByPk to throw an error
            const originalFindByPk = User.findByPk;
            User.findByPk = jest.fn().mockRejectedValue(new Error('Database error'));

            await authenticate(req, res, mockNext);

            expect(req.user).toBeNull();
            expect(mockNext).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);

            // Restore original method
            User.findByPk = originalFindByPk;
        });
    });

    describe('Token Security', () => {
        it('should not be possible to forge tokens without secret', () => {
            const fakeToken = jwt.sign(
                { userId: user.id, role: 'manager', email: user.email },
                'wrong_secret',
                { expiresIn: '1h' }
            );

            expect(() => {
                jwt.verify(fakeToken, process.env.JWT_SECRET);
            }).toThrow();
        });

        it('should not be possible to modify token payload', () => {
            const token = generateToken(user);
            
            // Try to modify the token by changing the role
            const decoded = jwt.decode(token);
            decoded.role = 'manager'; // Try to escalate privileges
            
            const modifiedToken = jwt.sign(decoded, 'wrong_secret');

            expect(() => {
                jwt.verify(modifiedToken, process.env.JWT_SECRET);
            }).toThrow();
        });

        it('should include necessary user information in token', () => {
            const token = generateToken(user);
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Check that all necessary information is included
            expect(decoded.userId).toBe(user.id);
            expect(decoded.role).toBe(user.role);
            expect(decoded.email).toBe(user.email);
            
            // Check that sensitive information is not included
            expect(decoded.password).toBeUndefined();
        });
    });
});
