'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Lowongan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Relasi ke PengajuanMagang tetap jika diperlukan
      this.hasMany(models.PengajuanMagang, {
        foreignKey: 'lowongan_id',
        as: 'pengajuanMagangs'
      });

      // Tambahkan relasi ke Perusahaan
      this.belongsTo(models.Perusahaan, {
        foreignKey: 'perusahaan_id',
        as: 'perusahaanData'
      });
    }
  }
  Lowongan.init({
    perusahaan: {
      type: DataTypes.STRING,
      allowNull: false
    },
    judul: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lokasi: {
      type: DataTypes.STRING,
      allowNull: false
    },
    durasi: {
      type: DataTypes.STRING,
      allowNull: false
    },
    deskripsi: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    kualifikasi: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tanggal_dibuka: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    tanggal_ditutup: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    link_berkas: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Lowongan',
    tableName: 'lowongan',
    timestamps: false
  });
  return Lowongan;
};
