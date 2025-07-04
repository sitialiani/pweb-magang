'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('pengajuan_magang', 'cv', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('pengajuan_magang', 'transkrip', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('pengajuan_magang', 'krs', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('pengajuan_magang', 'dokumen_pendukung', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('pengajuan_magang', 'keterangan', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('pengajuan_magang', 'tanggal_verifikasi', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('pengajuan_magang', 'cv');
    await queryInterface.removeColumn('pengajuan_magang', 'transkrip');
    await queryInterface.removeColumn('pengajuan_magang', 'krs');
    await queryInterface.removeColumn('pengajuan_magang', 'dokumen_pendukung');
    await queryInterface.removeColumn('pengajuan_magang', 'keterangan');
    await queryInterface.removeColumn('pengajuan_magang', 'tanggal_verifikasi');
  }
}; 