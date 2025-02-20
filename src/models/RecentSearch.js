'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RecentSearch extends Model {
    static associate(models) {
      RecentSearch.belongsTo(models.User, {
        foreignKey: 'userID',
        targetKey: 'username'
      });
    }
  }

  RecentSearch.init({
    userID: {
      type: DataTypes.STRING(255),
      references: {
        model: 'users',
        key: 'username'
      }
    },
    search_term: {
      type: DataTypes.TEXT
    },
    search_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'RecentSearch',
    tableName: 'recent_searches',
    timestamps: false
  });

  return RecentSearch;
}; 