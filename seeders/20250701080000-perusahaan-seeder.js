'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('perusahaan', [
      {
        nama: 'PT Telkom Indonesia',
        alamat: 'Jl. Japati No.1, Bandung',
        email: 'info@telkom.co.id',
        telepon: '022-4521405',
        pic: 'Manager HRD'
      },
      {
        nama: 'PT Bank Central Asia Tbk',
        alamat: 'Jl. MH Thamrin No.1, Jakarta',
        email: 'contact@bca.co.id',
        telepon: '021-23588000',
        pic: 'Manager Recruitment'
      },
      {
        nama: 'PT Astra International Tbk',
        alamat: 'Jl. Gaya Motor Raya No.8, Jakarta',
        email: 'info@astra.co.id',
        telepon: '021-50888888',
        pic: 'HR Manager'
      },
      {
        nama: 'PT Indofood Sukses Makmur Tbk',
        alamat: 'Jl. Jend. Sudirman Kav. 76-78, Jakarta',
        email: 'info@indofood.co.id',
        telepon: '021-57958888',
        pic: 'Manager HR'
      },
      {
        nama: 'PT Unilever Indonesia Tbk',
        alamat: 'Jl. Gatot Subroto Kav. 15, Jakarta',
        email: 'info@unilever.co.id',
        telepon: '021-5262112',
        pic: 'HR Director'
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('perusahaan', null, {});
  }
}; 