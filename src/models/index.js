const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require('../config/database')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// Test the database connection
sequelize.authenticate()
  .then(() => {
    console.log('✅ PostgreSQL Database connection has been established successfully.');
  })
  .catch(err => {
    console.error('❌ Unable to connect to the database:', err);
  });

fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Define associations
const models = {
  User: require('./User')(sequelize),
  Post: require('./Post')(sequelize),
  Category: require('./Category')(sequelize),
  Like: require('./Like')(sequelize),
  Comment: require('./Comment')(sequelize),
  Share: require('./Share')(sequelize),
  View: require('./View')(sequelize)
};

// User - Post associations
models.User.hasMany(models.Post, { as: 'posts', foreignKey: 'userId' });
models.Post.belongsTo(models.User, { as: 'author', foreignKey: 'userId' });
models.Post.belongsTo(models.User, { as: 'approver', foreignKey: 'approverId' });

// Category - Post associations
models.Category.hasMany(models.Post, { foreignKey: 'categoryId' });
models.Post.belongsTo(models.Category, { as: 'category' });

// Engagement associations
models.Post.hasMany(models.Like, { as: 'likes' });
models.Like.belongsTo(models.Post);
models.Like.belongsTo(models.User);

models.Post.hasMany(models.Comment, { as: 'comments' });
models.Comment.belongsTo(models.Post);
models.Comment.belongsTo(models.User);

models.Post.hasMany(models.Share, { as: 'shares' });
models.Share.belongsTo(models.Post);
models.Share.belongsTo(models.User);

models.Post.hasMany(models.View, { as: 'views' });
models.View.belongsTo(models.Post);
models.View.belongsTo(models.User);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = models; 