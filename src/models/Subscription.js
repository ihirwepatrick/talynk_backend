'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    static associate(models) {
      Subscription.belongsTo(models.User, {
        foreignKey: 'subscriberID',
        as: 'subscriber'
      });
      Subscription.belongsTo(models.User, {
        foreignKey: 'subscribed_to',
        as: 'subscribedTo'
      });
    }
  }

  Subscription.init({
    subscriberID: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      references: {
        model: 'users',
        key: 'username'
      }
    },
    subscribed_to: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      references: {
        model: 'users',
        key: 'username'
      }
    },
    subscription_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Subscription',
    tableName: 'subscriptions',
    timestamps: false
  });

  return Subscription;
}; 