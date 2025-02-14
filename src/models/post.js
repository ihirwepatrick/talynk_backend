'use strict';
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Post extends Model {
  static associate(models) {
    Post.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    
    Post.belongsTo(models.Admin, {
      foreignKey: 'adminId',
      as: 'admin'
    });
    
    Post.belongsTo(models.Approver, {
      foreignKey: 'approverId',
      as: 'approver'
    });
    Post.hasMany(models.Comment, {
      foreignKey: 'postID'
    });
    Post.hasMany(models.PostLike, {
      foreignKey: 'postID',
      sourceKey: 'uniqueTraceability_id'
    });
  }
}

Post.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  adminId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  approverId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  review_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  post_category: {
    type: DataTypes.STRING(255)
  },
  approvedDate: {
    type: DataTypes.DATE
  },
  uploadDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  length: {
    type: DataTypes.INTEGER
  },
  type: {
    type: DataTypes.STRING(50)
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  comments: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  shares: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  saves: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  sequelize,
  modelName: 'Post',
  tableName: 'posts',
  timestamps: true
});

module.exports = Post; 