'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Ad extends Model {
    static associate(models) {
      Ad.belongsTo(models.Admin, {
        foreignKey: 'uploaderID',
        targetKey: 'username'
      });
    }
  }

  Ad.init({
    adID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ad_video: {
      type: DataTypes.BLOB
    },
    upload_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.STRING(50),
      validate: {
        isIn: [['active', 'deleted']]
      }
    },
    uploaderID: {
      type: DataTypes.STRING(255),
      references: {
        model: 'admins',
        key: 'username'
      }
    }
  }, {
    sequelize,
    modelName: 'Ad',
    tableName: 'ads',
    timestamps: false
  });

  return Ad;
}; 