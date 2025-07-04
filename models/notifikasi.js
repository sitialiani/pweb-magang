'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Notifikasi extends Model {
    static associate(models) {
      // Definisikan relasi di sini jika ada
    }
  }
  Notifikasi.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    judul: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    pesan: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    dibaca: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    tanggal_kirim: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Notifikasi',
    tableName: 'notifikasi',
    timestamps: false
  });
  return Notifikasi;
};