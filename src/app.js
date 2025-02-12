require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { sequelize } = require('./models');
const path = require('path');
const routes = require('./routes');
const { authenticate, isAdmin } = require('./middlewares/auth');
const adminRoutes = require('./routes/admin');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
const { morganMiddleware, requestLogger } = require('./middleware/logger');
const { rateLimiters } = require('./middleware/extendedRateLimiter');
const { loggers } = require('./middleware/extendedLogger');
const { securityMiddleware, corsOptions, requestLimits } = require('./middleware/security');
const { validate } = require('./middleware/validator');

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      fontSrc: ["'self'", "cdnjs.cloudflare.com"]
    },
  }
}));
app.use(cors(corsOptions));
app.use(express.json({ limit: requestLimits.json }));
app.use(express.urlencoded({ extended: true, limit: requestLimits.urlencoded }));
app.use(compression());
app.use(morganMiddleware);
app.use(requestLogger);
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.mp4')) {
            res.set('Content-Type', 'video/mp4');
        }
    }
}));
app.use(express.static(path.join(__dirname, '../public'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (path.endsWith('.woff2')) {
            res.setHeader('Content-Type', 'font/woff2');
        } else if (path.endsWith('.woff')) {
            res.setHeader('Content-Type', 'font/woff');
        } else if (path.endsWith('.ttf')) {
            res.setHeader('Content-Type', 'font/ttf');
        }
    }
}));

// Set security headers middleware
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; style-src 'self' 'unsafe-inline'"
    );
    next();
});

// Add this after your existing middleware
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; img-src 'self' data: blob:; media-src 'self' data: blob:; style-src 'self' 'unsafe-inline';"
    );
    next();
});

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// Apply rate limiters to specific routes
app.use('/api/auth/login', rateLimiters.login);
app.use('/api/auth/register', rateLimiters.register);
app.use('/api/posts', rateLimiters.createPost);
app.use('/api/comments', rateLimiters.createComment);
app.use('/api/users/profile', rateLimiters.profileUpdate);
app.use('/api/search', rateLimiters.search);

// HTML Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/register.html'));
});

app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin-dashboard.html'));
});

app.get('/user-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/user-dashboard.html'));
});

app.get('/approver-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/approver-dashboard.html'));
});

// API routes
app.use('/api', routes);
app.use('/api/admin', adminRoutes);

// Logging
app.use((req, res, next) => {
    const startTime = Date.now();
    res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        loggers.access(req, res, responseTime);
    });
    next();
});

// Error handling
app.use(notFound);
app.use((err, req, res, next) => {
    loggers.error(err, req);
    errorHandler(err, req, res, next);
});

// Uncaught error handling
process.on('unhandledRejection', (err) => {
    loggers.error(err);
    // Graceful shutdown could be added here
});

process.on('uncaughtException', (err) => {
    loggers.error(err);
    // Graceful shutdown could be added here
});

const PORT = process.env.PORT || 3000;

// Test database connection before starting server
sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connected successfully.');
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Unable to connect to the database:', err);
  });

module.exports = app;