'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('feedback', 'laporan_id');
    } catch (e) {
      // Kolom sudah tidak ada, abaikan error
    }
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('feedback', 'laporan_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  }
}; 