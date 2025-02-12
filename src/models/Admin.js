'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    static associate(models) {
      Admin.belongsTo(models.User, {
        foreignKey: 'username'
      });
      Admin.hasMany(models.Ad, {
        foreignKey: 'uploaderID',
        sourceKey: 'username'
      });
    }
  }

  Admin.init({
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
    can_view_rejected: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    ads_management: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    can_view_all_approvers: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    can_register_approvers: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    can_manage_all_accounts: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Admin',
    tableName: 'admins',
    timestamps: false
  });

  return Admin;
}; 