'use strict';
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { uploadPengumuman, uploadTemplateDokumen } = require('../config/multer');

// 2. Impor middleware (jika ada nanti, misal untuk upload)
// const upload = require('../../config/multerConfig');

// =================================================================
// --- DEFINISI RUTE ADMIN ---
// Setiap rute sekarang memanggil fungsi dari controller
// =================================================================
// --- Rute Utama & Manajemen Pengguna ---
router.get('/dashboard', adminController.getDashboardPage);
router.get('/manajemen-pengguna', adminController.getManajemenPenggunaPage);
router.post('/manajemen-pengguna', adminController.addUser);
router.put('/manajemen-pengguna/:id/status', adminController.updateUserStatus);
router.put('/manajemen-pengguna/:id/reset-password', adminController.resetUserPassword);
router.put('/manajemen-pengguna/:id', adminController.updateUser);
router.delete('/manajemen-pengguna/:id', adminController.deleteUser);

// --- Rute Proses Magang ---
router.get('/pengajuan-magang', adminController.getPengajuanMagangPage);
router.get('/pengajuan/:id/detail', adminController.getDetailPengajuanAdmin);
router.post('/pengajuan/verifikasi/:id', adminController.verifikasiPengajuan);
router.get('/progress-magang/export-csv', adminController.exportProgressMagangCSV);
router.get('/progress-magang', adminController.getProgressMagangPage);
router.get('/dosen-pembimbing', adminController.getDosenPembimbingPage);
/**
 * @route   POST /admin/alokasi-pembimbing
 * @desc    Menangani submit form untuk alokasi pembimbing.
 */
router.post('/alokasi-pembimbing', adminController.alokasikanPembimbing);

// --- Rute Kemitraan & Lowongan ---
//tampila,hapus,tambah
router.get('/lowongan-magang', adminController.getLowongan);
router.post('/lowongan/tambah', adminController.tambahLowongan);
router.post('/lowongan/hapus/:id', adminController.hapusLowongan);


// Tampilkan halaman mitra
router.get('/mitra-perusahaan', adminController.getMitra);
router.post('/mitra-perusahaan/tambah', adminController.tambahMitra);
router.post('/mitra-perusahaan/edit', adminController.editMitra);
router.post('/mitra-perusahaan/hapus/:id', adminController.hapusMitra);


router.get('/feedback-perusahaan', adminController.getFeedbackPerusahaan);

router.post('/feedback-perusahaan/tambah', adminController.tambahFeedbackPerusahaan);
router.post('/feedback-perusahaan/hapus/:id', adminController.hapusFeedbackPerusahaan);

// Laporan Statistik
router.get('/laporan-statistik', adminController.getLaporanStatistik);


// --- Rute Konten & Komunikasi ---
router.get("/pengumuman", adminController.getPengumumanPage);

/**
 * @route   POST /admin/pengumuman/save
 * @desc    Menyimpan pengumuman baru.
 */
router.post('/pengumuman/save', uploadPengumuman.single('lampiran'), (err, req, res, next) => {
    if (err) {
        return res.status(400).json({ 
            success: false, 
            message: err.message 
        });
    }
    next();
}, adminController.savePengumuman);

/**
 * @route   PUT /admin/pengumuman/update
 * @desc    Mengupdate pengumuman yang sudah ada.
 */
router.put('/pengumuman/update', uploadPengumuman.single('lampiran'), (err, req, res, next) => {
    if (err) {
        return res.status(400).json({ 
            success: false, 
            message: err.message 
        });
    }
    next();
}, adminController.updatePengumuman);

/**
 * @route   DELETE /admin/pengumuman/delete/:id
 * @desc    Menghapus pengumuman berdasarkan ID.
 */
router.delete('/pengumuman/delete/:id', adminController.deletePengumuman);

/**
 * @route   GET /admin/pengumuman/api/all
 * @desc    Mengambil semua pengumuman untuk API.
 */
router.get('/pengumuman/api/all', adminController.getAllPengumuman);

// Template Dokumen
router.get('/template-dokumen', adminController.getTemplateDokumenPage);
router.post('/template-dokumen/tambah', uploadTemplateDokumen.single('file'), adminController.tambahTemplateDokumen);
router.put('/template-dokumen/update/:id', uploadTemplateDokumen.single('file'), adminController.updateTemplateDokumen);
router.delete('/template-dokumen/delete/:id', adminController.deleteTemplateDokumen);
router.get('/template-dokumen/download/:id', adminController.downloadTemplateDokumen);
router.get('/template-dokumen/:id', adminController.getTemplateDokumenById);


// --- Rute Pengaturan Sistem ---
router.get('/manajemen-backup', adminController.getManajemenBackupPage);
router.post('/manajemen-backup/create', adminController.createBackup);
router.get('/manajemen-backup/:id/download', adminController.downloadBackup);
router.post('/manajemen-backup/:id/delete', adminController.deleteBackup);

router.get("/Pengumuman_admin", (req, res) => {
  console.log("Route Pengumuman_admin dipanggil!"); // Tambahkan log ini
  res.render("Pengumuman_admin");
});

router.get("/dashboard_admin", (req, res) => {
  console.log("Route dashboard_admin dipanggil!"); // Tambahkan log ini
  res.render("dashboard_admin");
});

module.exports = router; // <<< WAJIB agar bisa di-require


// =================================================================
// --- EKSPOR ROUTER (WAJIB DI AKHIR FILE) ---
// =================================================================
module.exports = router;
