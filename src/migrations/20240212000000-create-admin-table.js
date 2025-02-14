'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('admins', {
      username: {
        type: Sequelize.STRING,
        primaryKey: true,
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
      can_view_approved: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      can_view_pending: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      can_view_rejected: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      ads_management: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      can_view_all_approvers: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      can_register_approvers: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      can_manage_all_accounts: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create default admin user
    await queryInterface.bulkInsert('admins', [{
      username: 'admin',
      email: 'admin@example.com',
      password: '$2a$10$your_hashed_password', // Make sure to hash the password
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('admins');
  }
}; 