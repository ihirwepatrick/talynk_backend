'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('admin', 'approver', 'user'),
        defaultValue: 'user'
      },
      phone1: {
        type: Sequelize.STRING,
        allowNull: true
      },
      phone2: {
        type: Sequelize.STRING,
        allowNull: true
      },
      facialImage: {
        type: Sequelize.STRING,
        allowNull: true
      },
      totalProfileViews: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      selectedCategoryId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      isFrozen: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      lastLoginDevice: {
        type: Sequelize.STRING,
        allowNull: true
      },
      rememberToken: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users');
  }
}; 