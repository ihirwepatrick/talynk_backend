require('dotenv').config();

module.exports = {
  development: {
    username: 'postgres',
    password: 'pll',
    database: 'talynk',
    host: 'localhost',
    port: 5432,
    dialect: 'postgres'
  },
  test: {
    username: 'postgres',
    password: 'pll',
    database: 'talynk_test',
    host: 'localhost',
    port: 5432,
    dialect: 'postgres'
  },
  production: {
    username: 'postgres',
    password: 'pll',
    database: 'talynk_production',
    host: 'localhost',
    port: 5432,
    dialect: 'postgres'
  }
}; 