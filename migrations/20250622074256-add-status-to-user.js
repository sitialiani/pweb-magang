'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Dikosongkan/dikomentari agar tidak error duplicate column
    // await queryInterface.addColumn('user', 'status', {
    //   type: Sequelize.STRING,
    //   allowNull: true
    // });
  },

  async down(queryInterface, Sequelize) {
    // Dikosongkan/dikomentari agar tidak error
    // await queryInterface.removeColumn('user', 'status');
  }
};
