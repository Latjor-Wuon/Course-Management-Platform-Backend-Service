const Redis = require('redis');

let redisClient;

const connectRedis = async () => {
    try {
        redisClient = Redis.createClient({
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
            retryDelayOnFailover: 100,
            maxRetriesPerRequest: 3,
        });

        redisClient.on('error', (err) => {
            console.error('Redis Client Error:', err);
        });

        redisClient.on('connect', () => {
            console.log('Connected to Redis');
        });

        await redisClient.connect();
        return redisClient;
    } catch (error) {
        console.error('Redis connection error:', error);
        throw error;
    }
};

const getRedisClient = () => {
    if (!redisClient) {
        throw new Error('Redis client not initialized. Call connectRedis() first.');
    }
    return redisClient;
};

module.exports = {
    connectRedis,
    getRedisClient
};
