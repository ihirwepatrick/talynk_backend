const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
});

// Specific route limiters
exports.rateLimiters = {
    // Auth routes
    login: rateLimit({
        store: new RedisStore({
            client: redis,
            prefix: 'rl:login:'
        }),
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // 5 attempts
        message: {
            status: 'error',
            message: 'Too many login attempts. Please try again later.'
        }
    }),

    register: rateLimit({
        store: new RedisStore({
            client: redis,
            prefix: 'rl:register:'
        }),
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 3, // 3 attempts
        message: {
            status: 'error',
            message: 'Too many registration attempts. Please try again later.'
        }
    }),

    // Content creation
    createPost: rateLimit({
        store: new RedisStore({
            client: redis,
            prefix: 'rl:post:'
        }),
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 10, // 10 posts
        message: {
            status: 'error',
            message: 'Post limit reached. Please try again later.'
        }
    }),

    createComment: rateLimit({
        store: new RedisStore({
            client: redis,
            prefix: 'rl:comment:'
        }),
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 50, // 50 comments
        message: {
            status: 'error',
            message: 'Comment limit reached. Please try again later.'
        }
    }),

    // Profile updates
    profileUpdate: rateLimit({
        store: new RedisStore({
            client: redis,
            prefix: 'rl:profile:'
        }),
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 5, // 5 updates
        message: {
            status: 'error',
            message: 'Too many profile updates. Please try again later.'
        }
    }),

    // Search
    search: rateLimit({
        store: new RedisStore({
            client: redis,
            prefix: 'rl:search:'
        }),
        windowMs: 60 * 1000, // 1 minute
        max: 10, // 10 searches
        message: {
            status: 'error',
            message: 'Search limit reached. Please try again later.'
        }
    })
}; 