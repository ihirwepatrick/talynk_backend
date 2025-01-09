'use strict';

module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {});

  Category.associate = function(models) {
    Category.hasMany(models.Post, {
      foreignKey: 'categoryId',
      as: 'posts'
    });
  };

  return Category;
}; 