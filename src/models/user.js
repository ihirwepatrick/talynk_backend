'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'approver', 'user'),
      defaultValue: 'user'
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
    tableName: 'Users',
    timestamps: true
  });

  return User;
};