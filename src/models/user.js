'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    primaryPhone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    secondaryPhone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    faceImageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }
  }, {});

  User.associate = function(models) {
    User.hasMany(models.Post, {
      foreignKey: 'userId',
      as: 'posts'
    });
  };

  return User;
};