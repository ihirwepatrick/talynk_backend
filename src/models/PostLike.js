'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PostLike = sequelize.define('PostLike', {
  userID: {
    type: DataTypes.STRING(255),
    primaryKey: true,
    references: {
      model: 'users',
      key: 'username'
    }
  },
  postID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'posts',
      key: 'uniqueTraceability_id'
    }
  },
  like_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'post_likes',
  timestamps: false
});

// Define associations in a separate function to be called after all models are loaded
PostLike.associate = (models) => {
  PostLike.belongsTo(models.User, {
    foreignKey: 'userID',
    targetKey: 'username'
  });
  PostLike.belongsTo(models.Post, {
    foreignKey: 'postID'
  });
};

module.exports = PostLike; 