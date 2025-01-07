const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    static associate(models) {
      // define associations here
      Post.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'author'
      });
      
      Post.belongsTo(models.Category, {
        foreignKey: 'categoryId',
        as: 'category'
      });
    }
  }

  Post.init({
    publicId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    mediaType: {
      type: DataTypes.ENUM('video', 'picture'),
      allowNull: false
    },
    mediaUrl: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Post',
    timestamps: true
  });

  return Post;
};