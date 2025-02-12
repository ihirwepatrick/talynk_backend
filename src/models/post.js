'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    static associate(models) {
      Post.belongsTo(models.User, {
        foreignKey: 'uploaderID',
        targetKey: 'username'
      });
      Post.belongsTo(models.Approver, {
        foreignKey: 'approverID',
        targetKey: 'username'
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
    uniqueTraceability_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    uploaderID: {
      type: DataTypes.STRING(255),
      allowNull: false,
      references: {
        model: 'users',
        key: 'username'
      }
    },
    post_status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['pending', 'approved']]
      }
    },
    post_category: {
      type: DataTypes.STRING(255)
    },
    approverID: {
      type: DataTypes.STRING(255),
      references: {
        model: 'approvers',
        key: 'username'
      }
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
    timestamps: false
  });

  return Post;
}; 