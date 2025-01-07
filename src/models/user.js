const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../src/config/database');

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 30],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    primaryPhone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: /^\+?[\d\s-()]{10,}$/,
      },
    },
    secondaryPhone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: /^\+?[\d\s-()]{10,}$/,
      },
    },
  },
  {
    sequelize,
    modelName: 'User',
    timestamps: true,
    paranoid: true,
  }
);

User.associate = function(models) {
  // User's approved posts
  User.hasMany(models.Post, {
    foreignKey: 'userId',
    as: 'approvedPosts',
    scope: {
      status: 'approved'
    }
  });

  // User's pending posts
  User.hasMany(models.Post, {
    foreignKey: 'userId',
    as: 'pendingPosts',
    scope: {
      status: 'pending'
    }
  });

  // Categories that the user has posted in
  User.belongsToMany(models.Category, {
    through: 'UserCategories',
    foreignKey: 'userId',
    as: 'postCategories'
  });
};

module.exports = User;