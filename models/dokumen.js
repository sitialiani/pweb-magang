// src/models/Dokumen.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Dokumen extends Model {
    static associate(models) {
      // Dokumen milik satu PengajuanMagang
      Dokumen.belongsTo(models.PengajuanMagang, {
        foreignKey: 'pengajuan_id',
        as: 'pengajuan'
      });
    }
  }
  Dokumen.init({
    pengajuan_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nama_file: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    jenis: {
      type: DataTypes.ENUM('CV', 'transkrip', 'surat', 'proposal', 'lainnya'),
      allowNull: false
    },
    file_path: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    tanggal_upload: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Dokumen',
    tableName: 'dokumen',
    timestamps: false
  });
  return Dokumen;
};
