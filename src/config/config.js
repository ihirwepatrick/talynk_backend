require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'talynk',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql'
  },
  test: {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'talynk_test',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql'
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'talynk',
    host: process.env.DB_HOST,
    dialect: 'mysql'
  }
}; 