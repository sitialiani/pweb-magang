'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Rekapitulasi extends Model {
    static associate(models) {
      // Definisikan relasi di sini jika ada
    }
  }
  Rekapitulasi.init({
    mahasiswa_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true // One-to-One
    },
    nilai_akhir: {
      type: DataTypes.FLOAT
    },
    status_laporan: {
      type: DataTypes.ENUM('selesai', 'revisi', 'belum'),
      allowNull: false
    },
    tanggal_rekap: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Rekapitulasi',
    tableName: 'rekapitulasi',
    timestamps: false
  });
  return Rekapitulasi;
};
