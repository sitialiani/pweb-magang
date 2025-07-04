'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    
    // Check if status column exists in users table
    const usersTableInfo = await queryInterface.describeTable('users');
    if (!usersTableInfo.status) {
      // Tambahkan kolom status ke tabel users
      await queryInterface.addColumn('users', 'status', {
        type: Sequelize.ENUM('Aktif', 'Non-Aktif'),
        defaultValue: 'Aktif',
        allowNull: false
      });
      console.log('Kolom status berhasil ditambahkan ke tabel users');
    } else {
      console.log('Kolom status sudah ada di tabel users');
    }

    // Check if nim column exists in mahasiswa table
    const mahasiswaTableInfo = await queryInterface.describeTable('mahasiswa');
    if (!mahasiswaTableInfo.nim) {
      // Tambahkan kolom nim ke tabel mahasiswa
      await queryInterface.addColumn('mahasiswa', 'nim', {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      });
      console.log('Kolom nim berhasil ditambahkan ke tabel mahasiswa');
    } else {
      console.log('Kolom nim sudah ada di tabel mahasiswa');
    }
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // Hapus kolom yang ditambahkan
    await queryInterface.removeColumn('users', 'status');
    await queryInterface.removeColumn('mahasiswa', 'nim');
  }
};
