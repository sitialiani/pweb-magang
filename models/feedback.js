'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Feedback extends Model {
    static associate(models) {
      Feedback.belongsTo(models.Perusahaan, {
        foreignKey: 'perusahaan_id',
        as: 'perusahaanData'
      });
    }
  }
  Feedback.init({
    namaMahasiswa: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nim: {
      type: DataTypes.STRING,
      allowNull: false
    },
    perusahaan_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'perusahaan',
        key: 'id'
      }
    },
    tanggal: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    isi: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Feedback',
    tableName: 'feedback',
    timestamps: false
  });
  return Feedback;
};
