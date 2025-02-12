'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Approver extends Model {
    static associate(models) {
      Approver.belongsTo(models.User, {
        foreignKey: 'username'
      });
      Approver.hasMany(models.Post, {
        foreignKey: 'approverID',
        sourceKey: 'username'
      });
    }
  }

  Approver.init({
    username: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      references: {
        model: 'users',
        key: 'username'
      }
    },
    can_view_approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    can_view_pending: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    can_view_all_accounts: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Approver',
    tableName: 'approvers',
    timestamps: false
  });

  return Approver;
}; 