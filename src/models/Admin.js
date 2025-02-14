'use strict';
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Admin extends Model {
  static associate(models) {
    // Check if models exist before creating associations
    if (models.Post) {
      Admin.hasMany(models.Post, {
        foreignKey: 'adminId',
        as: 'posts'
      });
    }
    if (models.Approver) {
      Admin.hasMany(models.Approver, {
        foreignKey: 'registeredBy',
        as: 'approvers'
      });
    }
  }
}

Admin.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'admin'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },
  permissions: {
    type: DataTypes.JSON,
    defaultValue: {
      canManageUsers: true,
      canManageApprovers: true,
      canViewReports: true,
      canManageSettings: true
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
    defaultValue: false
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
  timestamps: true
});

module.exports = Admin; 