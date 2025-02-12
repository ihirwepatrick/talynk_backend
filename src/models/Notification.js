'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      Notification.belongsTo(models.User, {
        foreignKey: 'userID',
        targetKey: 'username'
      });
    }
  }

  Notification.init({
    notificationID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userID: {
      type: DataTypes.STRING(255),
      allowNull: false,
      references: {
        model: 'users',
        key: 'username'
      }
    },
    notification_text: {
      type: DataTypes.TEXT
    },
    notification_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications',
    timestamps: false
  });

  return Notification;
}; 