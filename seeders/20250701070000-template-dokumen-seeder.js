'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('template_dokumen', [
      {
        nama: 'Surat Pengantar Magang',
        nama_template: 'Surat Pengantar Magang',
        deskripsi: 'Template surat pengantar untuk pengajuan magang',
        file_path: '/files/templates/surat_pengantar.docx',
        file_name: 'surat_pengantar.docx',
        file_size: 25600,
        file_type: '.docx',
        status: 'aktif',
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nama: 'Form Penilaian Magang',
        nama_template: 'Form Penilaian Magang',
        deskripsi: 'Template form penilaian magang oleh dosen pembimbing',
        file_path: '/files/templates/form_penilaian.docx',
        file_name: 'form_penilaian.docx',
        file_size: 32000,
        file_type: '.docx',
        status: 'aktif',
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nama: 'Template Laporan Akhir',
        nama_template: 'Template Laporan Akhir',
        deskripsi: 'Template format laporan akhir magang',
        file_path: '/files/templates/template_laporan.docx',
        file_name: 'template_laporan.docx',
        file_size: 45000,
        file_type: '.docx',
        status: 'aktif',
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('template_dokumen', null, {});
  }
}; 