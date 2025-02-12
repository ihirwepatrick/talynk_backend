'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
      Comment.belongsTo(models.User, {
        foreignKey: 'commentorID',
        targetKey: 'username'
      });
      Comment.belongsTo(models.Post, {
        foreignKey: 'postID'
      });
    }
  }

  Comment.init({
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
    sequelize,
    modelName: 'Comment',
    tableName: 'comments',
    timestamps: false
  });

  return Comment;
}; 