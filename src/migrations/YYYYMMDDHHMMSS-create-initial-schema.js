'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create Users table
    await queryInterface.createTable('Users', {
      // ... all User model fields ...
    });

    // Create Posts table
    await queryInterface.createTable('Posts', {
      // ... all Post model fields ...
    });

    // Create Comments table
    await queryInterface.createTable('Comments', {
      // ... all Comment model fields ...
    });

    // Create other tables...
    // Add indexes and foreign keys...
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order
    await queryInterface.dropTable('Comments');
    await queryInterface.dropTable('Posts');
    await queryInterface.dropTable('Users');
    // Drop other tables...
  }
}; 