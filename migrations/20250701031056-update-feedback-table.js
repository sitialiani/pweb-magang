'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Hapus kolom lama jika ada
    try {
      await queryInterface.removeColumn('feedback', 'dosen_id');
    } catch (error) {
      console.log('Kolom dosen_id tidak ada atau sudah dihapus');
    }
    
    try {
      await queryInterface.removeColumn('feedback', 'laporan_id');
    } catch (error) {
      console.log('Kolom laporan_id tidak ada atau sudah dihapus');
    }
    
    try {
      await queryInterface.removeColumn('feedback', 'pesan');
    } catch (error) {
      console.log('Kolom pesan tidak ada atau sudah dihapus');
    }

    // Tambah kolom baru
    try {
      await queryInterface.addColumn('feedback', 'namaMahasiswa', {
        type: Sequelize.STRING,
        allowNull: false
      });
    } catch (error) {
      console.log('Kolom namaMahasiswa sudah ada');
    }

    try {
      await queryInterface.addColumn('feedback', 'nim', {
        type: Sequelize.STRING,
        allowNull: false
      });
    } catch (error) {
      console.log('Kolom nim sudah ada');
    }

    try {
      await queryInterface.addColumn('feedback', 'perusahaan', {
        type: Sequelize.STRING,
        allowNull: false
      });
    } catch (error) {
      console.log('Kolom perusahaan sudah ada');
    }

    try {
      await queryInterface.addColumn('feedback', 'isi', {
        type: Sequelize.TEXT,
        allowNull: false
      });
    } catch (error) {
      console.log('Kolom isi sudah ada');
    }

    // Ubah kolom tanggal jika perlu
    await queryInterface.changeColumn('feedback', 'tanggal', {
      type: Sequelize.DATEONLY,
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    // Hapus kolom baru
    await queryInterface.removeColumn('feedback', 'namaMahasiswa');
    await queryInterface.removeColumn('feedback', 'nim');
    await queryInterface.removeColumn('feedback', 'perusahaan');
    await queryInterface.removeColumn('feedback', 'isi');

    // Kembalikan kolom lama
    await queryInterface.addColumn('feedback', 'dosen_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn('feedback', 'laporan_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn('feedback', 'pesan', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('feedback', 'mahasiswa_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    // Kembalikan kolom tanggal
    await queryInterface.changeColumn('feedback', 'tanggal', {
      type: Sequelize.DATE,
      allowNull: true
    });
  }
};
