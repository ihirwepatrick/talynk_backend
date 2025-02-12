'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PostLike extends Model {
    static associate(models) {
      PostLike.belongsTo(models.User, {
        foreignKey: 'userID',
        targetKey: 'username'
      });
      PostLike.belongsTo(models.Post, {
        foreignKey: 'postID'
      });
    }
  }

  PostLike.init({
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
    sequelize,
    modelName: 'PostLike',
    tableName: 'post_likes',
    timestamps: false
  });

  return PostLike;
}; 