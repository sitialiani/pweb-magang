'use strict';
const bcrypt = require('bcryptjs'); // Pastikan Anda sudah menginstal bcryptjs

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 1. Data untuk tabel 'users' - ID akan di-generate otomatis oleh DB
    const AndiPassword = await bcrypt.hash('andi_password', 10);
    const budiPassword = await bcrypt.hash('budi_password', 10);
    const AminahPassword = await bcrypt.hash('aminah_password', 10);
    const DinaPassword = await bcrypt.hash('dina_password', 10);
    const FajarPassword = await bcrypt.hash('fajar_password', 10);
    const adminPassword = await bcrypt.hash('admin_password', 10);

    await queryInterface.bulkInsert('users', [{
      username: 'admin',
      password: adminPassword,
      email: 'admin@admin.com',
      role: 'admin',
      created_at: new Date()
    }, {
      username: 'andi',
      password: AndiPassword,
      email: 'andi@gmail.com',
      role: 'dosen',
      created_at: new Date()
    }, {
      username: 'budi',
      password: budiPassword,
      email: 'budi@gmail.com',
      role: 'mahasiswa',
      created_at: new Date()
    }, {
      username: 'aminah',
      password: AminahPassword,
      email: 'aminah@gmail.com',
      role: 'mahasiswa',
      created_at: new Date()
    }, {
      username: 'dina',
      password: DinaPassword,
      email: 'dina@gmail.com',
      role: 'mahasiswa',
      created_at: new Date()
    }, {
      username: 'fajar',
      password: FajarPassword,
      email: 'fajar@gmail.com',
      role: 'mahasiswa',
      created_at: new Date()
    }], {});

    // Dapatkan ID user yang baru saja dibuat secara dinamis
    const [users] = await queryInterface.sequelize.query("SELECT id, username, role FROM users;");
    const AndiUserId = users.find(u => u.username === 'andi' && u.role === 'dosen').id;
    const budiUserId = users.find(u => u.username === 'budi' && u.role === 'mahasiswa').id;
    const AminahUserId = users.find(u => u.username === 'aminah' && u.role === 'mahasiswa').id;
    const DinaUserId = users.find(u => u.username === 'dina' && u.role === 'mahasiswa').id;
    const FajarUserId = users.find(u => u.username === 'fajar' && u.role === 'mahasiswa').id;

    // 2. Data untuk tabel 'dosen'
    await queryInterface.bulkInsert('dosen', [{
      user_id: AndiUserId,
      nama: 'Prof. Dr. Andi Permana',
      nidn: '198001012005011001',
      email: 'andi.permana@example.com',
      telepon: '08123456789'
    }], {});

    // Dapatkan ID dosen yang baru saja dibuat secara dinamis
    const [dosen] = await queryInterface.sequelize.query(`SELECT id, nama FROM dosen WHERE user_id = ${AndiUserId};`);
    const AndiId = dosen[0].id;

    // 3. Data untuk tabel 'mahasiswa'
    await queryInterface.bulkInsert('mahasiswa', [{
      user_id: budiUserId,
      dosen_pembimbing_id: AndiId,
      nama: 'Budi Santoso',
      nim: '2022001',
      jurusan: 'Sistem Informasi',
      angkatan: 2022,
      no_hp: '081211122233'
    }, {
      user_id: AminahUserId,
      dosen_pembimbing_id: AndiId,
      nama: 'Siti Aminah',
      nim: '2022002',
      jurusan: 'Sistem Informasi',
      angkatan: 2022,
      no_hp: '081233344455'
    }, {
      user_id: DinaUserId,
      dosen_pembimbing_id: AndiId,
      nama: 'Dina Permata',
      nim: '2022003',
      jurusan: 'Sistem Informasi',
      angkatan: 2022,
      no_hp: '081244455566'
    }, {
      user_id: FajarUserId,
      dosen_pembimbing_id: AndiId,
      nama: 'Fajar Kurniawan',
      nim: '2022004',
      jurusan: 'Sistem Informasi',
      angkatan: 2022,
      no_hp: '081255566677'
    }], {});

    // Dapatkan ID mahasiswa yang baru saja dibuat secara dinamis
    const [mahasiswa] = await queryInterface.sequelize.query("SELECT id, nim FROM mahasiswa;");
    const budiMhsId = mahasiswa.find(m => m.nim === '2022001').id;
    const AminahMhsId = mahasiswa.find(m => m.nim === '2022002').id;
    const DinaMhsId = mahasiswa.find(m => m.nim === '2022003').id;
    const FajarMhsId = mahasiswa.find(m => m.nim === '2022004').id;

    // 4. Data untuk tabel 'perusahaan'
    await queryInterface.bulkInsert('perusahaan', [{
      nama: 'PT. Teknologi Maju',
      alamat: 'Jl. Sudirman No. 10 Jakarta',
      email: 'info@teknologimaju.com',
      telepon: '021-12345678',
      pic: 'Bpk. Rizky Pratama'
    }, {
      nama: 'CV. Solusi Digital',
      alamat: 'Jl. Thamrin No. 5 Bandung',
      email: 'contact@solusidigital.com',
      telepon: '022-98765432',
      pic: 'Ibu. Dewi Lestari'
    }], {});

    // Dapatkan ID perusahaan yang baru saja dibuat secara dinamis
    const [perusahaan] = await queryInterface.sequelize.query("SELECT id, nama FROM perusahaan;");
    const ptTeknologiMajuId = perusahaan.find(p => p.nama === 'PT. Teknologi Maju').id;
    const cvSolusiDigitalId = perusahaan.find(p => p.nama === 'CV. Solusi Digital').id;

    // 5. Data untuk tabel 'lowongan'
    await queryInterface.bulkInsert('lowongan', [{
      perusahaan_id: ptTeknologiMajuId,
      perusahaan: 'PT. Teknologi Maju',
      lokasi: 'Jakarta',
      durasi: '3 Bulan',
      deadlinependaftaran: '2025-10-31',
      deskripsi: 'Membangun antarmuka pengguna aplikasi web menggunakan ReactJS.',
    }, {
      perusahaan_id: cvSolusiDigitalId,
      perusahaan: 'CV. Solusi Digital',
      lokasi: 'Bandung',
      durasi: '6 Bulan',
      deadlinependaftaran: '2025-11-15',
      deskripsi: 'Mengembangkan dan memelihara API RESTful menggunakan Node.js dan Express.',
    }], {});

    // Dapatkan ID lowongan yang baru saja dibuat secara dinamis
    const [lowongan] = await queryInterface.sequelize.query("SELECT id, perusahaan, deskripsi FROM lowongan;");
    const frontendLowonganId = lowongan.find(l => l.perusahaan === 'PT. Teknologi Maju' && l.deskripsi.includes('ReactJS')).id;
    const backendLowonganId = lowongan.find(l => l.perusahaan === 'CV. Solusi Digital' && l.deskripsi.includes('Node.js')).id;

    // 6. Data untuk tabel 'pengajuan_magang' - Hanya satu pengajuan per mahasiswa
    await queryInterface.bulkInsert('pengajuan_magang', [{
      // Budi: Magang Diterima
      mahasiswa_id: budiMhsId,
      lowongan_id: frontendLowonganId,
      tanggal_pengajuan: '2025-06-10',
      status: 'diterima'
    }, {
      // Aminah: Magang Diterima
      mahasiswa_id: AminahMhsId,
      lowongan_id: backendLowonganId,
      tanggal_pengajuan: '2025-06-20',
      status: 'diterima'
    }, {
      // Dina: Magang Ditolak
      mahasiswa_id: DinaMhsId,
      lowongan_id: frontendLowonganId,
      tanggal_pengajuan: '2025-07-01',
      status: 'ditolak'
    }, {
      // Fajar: Magang Diajukan
      mahasiswa_id: FajarMhsId,
      lowongan_id: backendLowonganId,
      tanggal_pengajuan: '2025-07-05',
      status: 'diajukan'
    }], {});

    // Dapatkan ID pengajuan_magang yang baru saja dibuat secara dinamis
    const [pengajuanMagang] = await queryInterface.sequelize.query("SELECT id, mahasiswa_id, lowongan_id, status FROM pengajuan_magang;");
    const pengajuanBudiDiterimaId = pengajuanMagang.find(pm => pm.mahasiswa_id === budiMhsId && pm.status === 'diterima').id;
    const pengajuanAminahDiterimaId = pengajuanMagang.find(pm => pm.mahasiswa_id === AminahMhsId && pm.status === 'diterima').id;
    const pengajuanFajarDiajukanId = pengajuanMagang.find(pm => pm.mahasiswa_id === FajarMhsId && pm.status === 'diajukan').id;

    // 7. Data untuk tabel 'dokumen'
    await queryInterface.bulkInsert('dokumen', [{
      // Dokumen Budi (Pengajuan Diterima)
      pengajuan_id: pengajuanBudiDiterimaId,
      nama_file: 'Surat Penerimaan Budi Santoso.pdf',
      jenis: 'surat',
      file_path: '/docs/surat_budi_pm.pdf',
      tanggal_upload: '2025-06-11 09:00:00'
    }, {
      // Dokumen Budi (Pengajuan Diterima)
      pengajuan_id: pengajuanBudiDiterimaId,
      nama_file: 'CV Budi Santoso.pdf',
      jenis: 'CV',
      file_path: '/docs/cv_budi.pdf',
      tanggal_upload: '2025-06-09 14:30:00'
    }, {
      // Dokumen Aminah (Pengajuan Diterima)
      pengajuan_id: pengajuanAminahDiterimaId,
      nama_file: 'Surat Penerimaan Siti Aminah.pdf',
      jenis: 'surat',
      file_path: '/docs/surat_siti_pm.pdf',
      tanggal_upload: '2025-06-21 10:00:00'
    }, {
      // Dokumen Fajar (Pengajuan Diajukan)
      pengajuan_id: pengajuanFajarDiajukanId,
      nama_file: 'Proposal Magang Fajar.pdf',
      jenis: 'proposal',
      file_path: '/docs/proposal_fajar.pdf',
      tanggal_upload: '2025-07-06 11:00:00'
    }], {});

    // 8. Data untuk tabel 'logbook'
    await queryInterface.bulkInsert('logbook', [{
      // Logbook Budi - Evaluasi TRUE
      mahasiswa_id: budiMhsId,
      tanggal: '2025-07-01',
      kegiatan: 'Hari pertama orientasi perusahaan dan pengenalan tim.',
      verifikasi_dosen: true
    }, {
      // Logbook Budi - Evaluasi TRUE
      mahasiswa_id: budiMhsId,
      tanggal: '2025-07-08',
      kegiatan: 'Mulai mengerjakan modul otentikasi, belajar konfigurasi API.',
      verifikasi_dosen: true
    }, {
      // Logbook Aminah - Evaluasi TRUE
      mahasiswa_id: AminahMhsId,
      tanggal: '2025-07-15',
      kegiatan: 'Mempelajari arsitektur database proyek inventaris.',
      verifikasi_dosen: true
    }, {
      // Logbook Aminah - Evaluasi FALSE (Belum dievaluasi)
      mahasiswa_id: AminahMhsId,
      tanggal: '2025-07-22',
      kegiatan: 'Melakukan debugging pada endpoint laporan stok.',
      verifikasi_dosen: false
    }], {});

    // 9. Data untuk tabel 'laporan'
    await queryInterface.bulkInsert('laporan', [{
      // Laporan Budi - Status diterima (sudah dinilai)
      mahasiswa_id: budiMhsId,
      judul: 'Pengembangan Antarmuka Pengguna E-Commerce dengan ReactJS',
      file_path: '/files/laporan/budi_final_report.pdf',
      status: 'diterima',
      tanggal_upload: '2025-09-30 10:00:00'
    }, {
      // Laporan Aminah - Status belum dikumpulkan (belum dinilai)
      mahasiswa_id: AminahMhsId,
      judul: 'Implementasi API Restful untuk Sistem Manajemen Inventaris',
      file_path: '/files/laporan/siti_final_report.pdf',
      status: 'belum dikumpulkan',
      tanggal_upload: '2025-10-05 11:30:00'
    }], {});

    // 10. Data untuk tabel 'penilaian'
    await queryInterface.bulkInsert('penilaian', [{
      // Penilaian Budi (karena laporannya sudah diterima/dinilai)
      mahasiswa_id: budiMhsId,
      dosen_id: AndiId,
      nilai_akhir: 88.5,
      komentar: 'Kinerja: Sangat baik | Kedisiplinan: Sangat baik | Kolaborasi: Baik sekali',
      tanggal: new Date('2025-10-10')
    }], {});

    // 11. Data untuk tabel 'feedback'
    await queryInterface.bulkInsert('feedback', [{
      mahasiswa_id: budiMhsId,
      dosen_id: AndiId,
      pesan: 'Perkembangan logbook minggu pertama sangat baik, teruskan!',
      tanggal: new Date()
    }, {
      mahasiswa_id: AminahMhsId,
      dosen_id: AndiId,
      pesan: 'Pastikan mencatat setiap detail kegiatan agar mudah dilacak.',
      tanggal: new Date()
    }], {});

    // 12. Data untuk tabel 'pengumuman'
    const adminUserCheck = users.find(u => u.role === 'admin');
    const adminUserId = adminUserCheck ? adminUserCheck.id : AndiUserId;

    await queryInterface.bulkInsert('pengumuman', [{
      admin_user_id: adminUserId,
      judul: 'Jadwal Batas Akhir Unggah Laporan',
      isi: 'Batas akhir pengunggahan laporan akhir magang adalah 30 September 2025.',
      tanggal: new Date(),
      ditujukan_kepada: 'mahasiswa'
    }, {
      admin_user_id: adminUserId,
      judul: 'Pembekalan Dosen Pembimbing',
      isi: 'Akan ada pembekalan untuk dosen pembimbing pada tanggal 25 Juni 2025.',
      tanggal: new Date(),
      ditujukan_kepada: 'dosen'
    }], {});

    // 13. Data untuk tabel 'rekapitulasi'
    await queryInterface.bulkInsert('rekapitulasi', [{
      // Rekapitulasi Budi (karena laporannya sudah dinilai)
      mahasiswa_id: budiMhsId,
      nilai_akhir: 88.5, // Sesuai dengan nilai di penilaian
      status_laporan: 'selesai',
      tanggal_rekap: new Date('2025-10-10')
    }], {});
  },

  async down (queryInterface, Sequelize) {
    // Hapus semua data yang dimasukkan di atas. Urutan PENTING! Kebalikan dari urutan INSERT.
    await queryInterface.bulkDelete('rekapitulasi', {}, {});
    await queryInterface.bulkDelete('pengumuman', {}, {});
    await queryInterface.bulkDelete('feedback', {}, {});
    await queryInterface.bulkDelete('penilaian', {}, {});
    await queryInterface.bulkDelete('laporan', {}, {});
    await queryInterface.bulkDelete('logbook', {}, {});
    await queryInterface.bulkDelete('dokumen', {}, {});
    await queryInterface.bulkDelete('pengajuan_magang', {}, {});
    await queryInterface.bulkDelete('lowongan', {}, {});
    await queryInterface.bulkDelete('perusahaan', {}, {});
    await queryInterface.bulkDelete('mahasiswa', {}, {});
    await queryInterface.bulkDelete('dosen', {}, {});
    await queryInterface.bulkDelete('users', {}, {});
  }
};
