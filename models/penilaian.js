'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Penilaian extends Model {
    static associate(models) {
      // Definisikan relasi di sini jika ada
    }
  }
  Penilaian.init({
    mahasiswa_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true // Relasi One-to-One
    },
    dosen_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    laporan_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    nilai_akhir: {
      type: DataTypes.FLOAT
    },
    komentar: {
      type: DataTypes.TEXT
    },
    tanggal: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Penilaian',
    tableName: 'penilaian',
    timestamps: false
  });
  return Penilaian;
};
