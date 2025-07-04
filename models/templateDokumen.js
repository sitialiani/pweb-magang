'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TemplateDokumen extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }
  
  TemplateDokumen.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nama: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    deskripsi: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    file_path: {
      type: DataTypes.STRING,
      allowNull: false
    },
    file_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    file_type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('aktif', 'nonaktif'),
      defaultValue: 'aktif'
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'TemplateDokumen',
    tableName: 'template_dokumen',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  
  return TemplateDokumen;
};