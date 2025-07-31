// test-redis.js - Quick Redis connection test
const redis = require('redis');

async function testRedis() {
    const client = redis.createClient({
        host: 'localhost',
        port: 6379
    });

    try {
        await client.connect();
        console.log('✅ Redis connection successful!');
        
        // Test basic operations
        await client.set('test', 'Hello Redis!');
        const value = await client.get('test');
        console.log('✅ Redis test value:', value);
        
        await client.disconnect();
        console.log('✅ Redis test completed successfully!');
    } catch (error) {
        console.log('❌ Redis connection failed:', error.message);
        console.log('Make sure Redis server is running on localhost:6379');
    }
}

testRedis();
