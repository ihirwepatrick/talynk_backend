'use strict';
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class User extends Model {
  static associate(models) {
    // Define associations correctly
    User.hasMany(models.Post, {
      foreignKey: 'userId',
      as: 'posts'
    });
    User.hasMany(models.Comment, {
      foreignKey: 'commentorID',
      sourceKey: 'username'
    });
    User.hasMany(models.Notification, {
      foreignKey: 'userID',
      sourceKey: 'username'
    });
    User.hasOne(models.Admin, {
      foreignKey: 'username'
    });
    User.hasOne(models.Approver, {
      foreignKey: 'username'
    });
  }
}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone1: {
    type: DataTypes.STRING(15)
  },
  phone2: {
    type: DataTypes.STRING(15)
  },
  posts_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_profile_views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  user_facial_image: {
    type: DataTypes.BLOB
  },
  selected_category: {
    type: DataTypes.STRING(255)
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  notification: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  recent_searches: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  subscribers: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  remember_me: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: false
});

module.exports = User;