'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Comment = sequelize.define('Comment', {
  commentID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  commentorID: {
    type: DataTypes.STRING(255),
    allowNull: false,
    references: {
      model: 'users',
      key: 'username'
    }
  },
  commentDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  postID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'posts',
      key: 'uniqueTraceability_id'
    }
  },
  commentText: {
    type: DataTypes.TEXT
  },
  comment_reports: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'comments',
  timestamps: false
});

// Define associations in a separate function to be called after all models are loaded
Comment.associate = (models) => {
  Comment.belongsTo(models.User, {
    foreignKey: 'commentorID',
    targetKey: 'username'
  });
  Comment.belongsTo(models.Post, {
    foreignKey: 'postID'
  });
};

module.exports = Comment; 