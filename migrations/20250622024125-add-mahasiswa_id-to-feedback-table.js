'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Dikosongkan/dikomentari agar tidak error duplicate column
    // await queryInterface.addColumn(
    //   'feedback',
    //   'mahasiswa_id',
    //   {
    //     type: Sequelize.INTEGER,
    //     allowNull: true,
    //     references: {
    //       model: 'mahasiswa',
    //       key: 'id',
    //     },
    //     onUpdate: 'CASCADE',
    //     onDelete: 'SET NULL',
    //   }
    // );
  },

  async down(queryInterface, Sequelize) {
    // Dikosongkan/dikomentari agar tidak error
    // await queryInterface.removeColumn('feedback', 'mahasiswa_id');
  }
};
