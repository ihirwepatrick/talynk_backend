const { Sequelize } = require('sequelize');
require('dotenv').config();

const isTest = process.env.NODE_ENV === 'test';

const sequelize = new Sequelize(
    isTest ? process.env.TEST_DB_NAME : 'talynk2',
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        logging: false, // Disable logging in test environment
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// Test database connection
sequelize.authenticate()
    .then(() => {
        console.log('Connection to PostgreSQL database has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to PostgreSQL database:', err);
    });

module.exports = sequelize;