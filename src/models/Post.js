'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  unique_traceability_id: {
    type: DataTypes.STRING,
    unique: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  shares: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  videoUrl: {
    type: DataTypes.STRING,
    defaultValue: 'not found'
  }
}, {
  tableName: 'posts',
  timestamps: true,
  underscored: true
});

// Define associations in a separate function to be called after all models are loaded
Post.associate = (models) => {
  Post.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'author'
  });
  Post.belongsTo(models.Approver, {
    foreignKey: 'approver_id',
    as: 'approver'
  });
  
  Post.belongsTo(models.Admin, {
    foreignKey: 'adminId',
    as: 'admin'
  });
  
  Post.belongsTo(models.Approver, {
    foreignKey: 'approver_id',
    as: 'approver'
  });
  Post.hasMany(models.Comment, {
    foreignKey: 'postID'
  });
  Post.hasMany(models.PostLike, {
    foreignKey: 'postID',
    sourceKey: 'unique_traceability_id'
  });
  Post.belongsTo(models.Category, {
    foreignKey: 'category_id',
    as: 'category'
  });
};

module.exports = Post; 