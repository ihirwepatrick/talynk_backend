'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AccountManagement extends Model {
    static associate(models) {
      AccountManagement.belongsTo(models.User, {
        foreignKey: 'accountID',
        targetKey: 'username'
      });
    }
  }

  AccountManagement.init({
    accountID: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      references: {
        model: 'users',
        key: 'username'
      }
    },
    account_status: {
      type: DataTypes.STRING(50),
      validate: {
        isIn: [['active', 'freezed', 'deleted']]
      }
    },
    freeze_date: {
      type: DataTypes.DATE
    },
    delete_date: {
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'AccountManagement',
    tableName: 'account_management',
    timestamps: false
  });

  return AccountManagement;
}; 