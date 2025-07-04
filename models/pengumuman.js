'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pengumuman extends Model {
    static associate(models) {
      // Definisikan relasi di sini jika ada
    }
  }
  Pengumuman.init({
    admin_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true // Bisa null jika tidak merujuk ke user admin
    },
    judul: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    isi: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    tanggal: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    ditujukan_kepada: {
      type: DataTypes.ENUM('semua', 'mahasiswa', 'dosen'),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Pengumuman',
    tableName: 'pengumuman',
    timestamps: false
  });
  return Pengumuman;
};
