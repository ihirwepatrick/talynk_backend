const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Check if Post model exists before creating association
      if (models.Post) {
        User.hasMany(models.Post, {
          foreignKey: 'userId',
          as: 'posts'
        });
      }
    }
  }

  User.init({
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
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastLogin: {
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'User',
    timestamps: true,
    paranoid: true
  });

  return User;
}