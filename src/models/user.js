'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Post, {
        foreignKey: 'userId',
        as: 'posts'
      });
    }
  }
  
  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'approver', 'user'),
      defaultValue: 'user'
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone1: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone2: {
      type: DataTypes.STRING,
      allowNull: true
    },
    facialImage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    totalProfileViews: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    selectedCategoryId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isFrozen: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    lastLoginDevice: {
      type: DataTypes.STRING,
      allowNull: true
    },
    rememberToken: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'User',
  });

  return User;
};