const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
});

// General API limiter
exports.apiLimiter = rateLimit({
    store: new RedisStore({
        client: redis,
        prefix: 'rl:api:'
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// Auth routes limiter
exports.authLimiter = rateLimit({
    store: new RedisStore({
        client: redis,
        prefix: 'rl:auth:'
    }),
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5 // limit each IP to 5 requests per windowMs
});

// Post creation limiter
exports.postLimiter = rateLimit({
    store: new RedisStore({
        client: redis,
        prefix: 'rl:post:'
    }),
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10 // limit each IP to 10 posts per windowMs
}); 