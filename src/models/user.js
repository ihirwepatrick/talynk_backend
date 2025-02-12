'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Associations
      User.hasMany(models.Post, {
        foreignKey: 'uploaderID',
        sourceKey: 'username'
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
    username: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
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
      type: DataTypes.STRING(255),
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
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: false
  });

  return User;
};