require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'ihirwe',
    password: process.env.DB_PASS || 'TzJ9V8GcABTVAA5rrRIy3yr6XDZ8MPnD',
    database: process.env.DB_NAME || 'talynk',
    host: process.env.DB_HOST || 'postgresql://ihirwe:TzJ9V8GcABTVAA5rrRIy3yr6XDZ8MPnD@dpg-cv1aepdds78s73dlflcg-a.oregon-postgres.render.com/talynk',
    dialect: 'postgres',
    port: 5432
  },
  test: {
    username: process.env.DB_USER || 'ihirwe',
    password: process.env.DB_PASS || 'TzJ9V8GcABTVAA5rrRIy3yr6XDZ8MPnD',
    database: process.env.DB_NAME || 'talynk',
    host: process.env.DB_HOST || 'postgresql://ihirwe:TzJ9V8GcABTVAA5rrRIy3yr6XDZ8MPnD@dpg-cv1aepdds78s73dlflcg-a.oregon-postgres.render.com/talynk',
    dialect: 'postgres',
    port: 5432
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
}; 