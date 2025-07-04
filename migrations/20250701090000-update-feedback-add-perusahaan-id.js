'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Tambah kolom perusahaan_id
    await queryInterface.addColumn('feedback', 'perusahaan_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'perusahaan',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Migrasi data dari kolom perusahaan (string) ke perusahaan_id
    // (asumsi nama perusahaan unik)
    await queryInterface.sequelize.query(`
      UPDATE feedback f
      JOIN perusahaan p ON f.perusahaan = p.nama
      SET f.perusahaan_id = p.id
    `);

    // Ubah perusahaan_id jadi NOT NULL jika semua data sudah termigrasi
    await queryInterface.changeColumn('feedback', 'perusahaan_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'perusahaan',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Hapus kolom perusahaan (string)
    await queryInterface.removeColumn('feedback', 'perusahaan');
  },

  down: async (queryInterface, Sequelize) => {
    // Tambah kembali kolom perusahaan (string)
    await queryInterface.addColumn('feedback', 'perusahaan', {
      type: Sequelize.STRING,
      allowNull: true
    });
    // (Opsional) Migrasi balik data dari perusahaan_id ke perusahaan (string)
    await queryInterface.sequelize.query(`
      UPDATE feedback f
      JOIN perusahaan p ON f.perusahaan_id = p.id
      SET f.perusahaan = p.nama
    `);
    // Hapus kolom perusahaan_id
    await queryInterface.removeColumn('feedback', 'perusahaan_id');
  }
}; 