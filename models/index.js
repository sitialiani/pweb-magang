// src/models/index.js
const { DataTypes } = require('sequelize');
const sequelize = require('../src/config/sequelize');
const User = require('./user')(sequelize, DataTypes);
const Mahasiswa = require('./mahasiswa')(sequelize, DataTypes);
const Dosen = require('./dosen')(sequelize, DataTypes);
const Perusahaan = require('./perusahaan')(sequelize, DataTypes);
const Lowongan = require('./lowongan')(sequelize, DataTypes);
const PengajuanMagang = require('./pengajuanMagang')(sequelize, DataTypes);
const Dokumen = require('./dokumen')(sequelize, DataTypes);
const Logbook = require('./logbook')(sequelize, DataTypes);
const Laporan = require('./laporan')(sequelize, DataTypes);
const Penilaian = require('./penilaian')(sequelize, DataTypes);
const Notifikasi = require('./notifikasi')(sequelize, DataTypes);
const Feedback = require('./feedback')(sequelize, DataTypes);
const TemplateDokumen = require('./templateDokumen')(sequelize, DataTypes);
const Pengumuman = require('./pengumuman')(sequelize, DataTypes);
const Rekapitulasi = require('./rekapitulasi')(sequelize, DataTypes);

const db = {
  sequelize,
  User,
  Mahasiswa,
  Dosen,
  Perusahaan,
  Lowongan,
  PengajuanMagang,
  Dokumen,
  Logbook,
  Laporan,
  Penilaian,
  Notifikasi,
  Feedback,
  TemplateDokumen,
  Pengumuman,
  Rekapitulasi
};

// Setup associations jika ada
Object.keys(db).forEach(modelName => {
  if (db[modelName] && db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
