'use strict';
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Approver extends Model {
  static associate(models) {
    Approver.belongsTo(models.Admin, {
      foreignKey: 'registeredBy',
      as: 'registeredByAdmin'
    });
    
    Approver.hasMany(models.Post, {
      foreignKey: 'approverID',
      as: 'approvedPosts'
    });
  }
}

Approver.init({
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
    defaultValue: 'approver'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },
  registeredBy: {
    type: DataTypes.STRING,
    references: {
      model: 'admins',
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
  timestamps: true
});

module.exports = Approver; 