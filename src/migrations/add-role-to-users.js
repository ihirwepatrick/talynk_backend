'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'role', {
      type: Sequelize.ENUM('user', 'admin'),
      defaultValue: 'user',
      allowNull: false
    });

    // Optionally set an admin user
    await queryInterface.sequelize.query(`
      UPDATE "Users" 
      SET role = 'admin' 
      WHERE username = 'admin';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'role');
    // Drop the ENUM type as well
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_role";');
  }
}; 