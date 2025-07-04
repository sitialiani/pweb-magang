'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Laporan extends Model {
    static associate(models) {
      this.belongsTo(models.Mahasiswa, { foreignKey: 'mahasiswa_id', as: 'mahasiswa' });
      this.hasMany(models.Feedback, { foreignKey: 'laporan_id', as: 'feedbacks' });
    }
  }
  
  // PERBAIKAN: Gunakan camelCase untuk semua atribut
  Laporan.init({
    mahasiswaId: { // Diubah dari mahasiswa_id
      type: DataTypes.INTEGER,
      allowNull: false
    },
    judul: DataTypes.STRING,
    filePath: DataTypes.TEXT, // Diubah dari file_path
    status: DataTypes.ENUM('belum dikumpulkan', 'menunggu', 'revisi', 'diterima'),
    tanggalUpload: DataTypes.DATE, // Diubah dari tanggal_upload
    versi: DataTypes.STRING
  }, { 
    sequelize,
    modelName: 'Laporan',
    tableName: 'laporan',
    timestamps: false,   
    underscored: true,   // Otomatis ubah camelCase ke snake_case (cth: mahasiswaId -> mahasiswa_id)
  });
  return Laporan;
};
