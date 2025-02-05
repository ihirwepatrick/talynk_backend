const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
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

// User associations
db.User.hasMany(db.Post, { as: 'posts', foreignKey: 'uploaderId' });
db.User.hasMany(db.Post, { as: 'approvedPosts', foreignKey: 'approverId' });
db.User.hasMany(db.Comment);
db.User.hasMany(db.Notification);
db.User.hasMany(db.RecentSearch);
db.User.belongsTo(db.Category, { as: 'selectedCategory', foreignKey: 'selectedCategoryId' });

// Post associations
db.Post.belongsTo(db.User, { as: 'uploader', foreignKey: 'uploaderId' });
db.Post.belongsTo(db.User, { as: 'approver', foreignKey: 'approverId' });
db.Post.belongsTo(db.Category);
db.Post.hasMany(db.Comment);

// Comment associations
db.Comment.belongsTo(db.Post);
db.Comment.belongsTo(db.User);

// Create subscribers association
db.User.belongsToMany(db.User, {
  through: 'Subscribers',
  as: 'subscribers',
  foreignKey: 'userId',
  otherKey: 'subscriberId'
});

// Create likes association
db.User.belongsToMany(db.Post, {
  through: 'Likes',
  as: 'likedPosts',
  foreignKey: 'userId',
  otherKey: 'postId'
});

// Create saves association
db.User.belongsToMany(db.Post, {
  through: 'Saves',
  as: 'savedPosts',
  foreignKey: 'userId',
  otherKey: 'postId'
});

// Initialize models
const models = {
  User: require('./User')(sequelize),
  Post: require('./Post')(sequelize),
  Category: require('./Category')(sequelize),
  Like: require('./Like')(sequelize),
  Comment: require('./Comment')(sequelize),
  Share: require('./Share')(sequelize),
  View: require('./View')(sequelize)
};

// Define associations
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

// Add models to db object
Object.keys(models).forEach(modelName => {
  db[modelName] = models[modelName];
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db; 