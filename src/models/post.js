'use strict';

module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    caption: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    mediaUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    mediaType: {
      type: DataTypes.ENUM('image', 'video'),
      allowNull: true
    },
    mediaMetadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    },
    uploaderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    approverId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Post',
    tableName: 'Posts',
    timestamps: true
  });

  Post.associate = function(models) {
    Post.belongsTo(models.User, {
      foreignKey: 'uploaderId',
      as: 'uploader'
    });
    Post.belongsTo(models.User, {
      foreignKey: 'approverId',
      as: 'approver'
    });
    Post.belongsTo(models.Category, {
      foreignKey: 'categoryId'
    });
  };

  return Post;
}; 