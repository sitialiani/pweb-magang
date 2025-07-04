'use strict';
// Impor semua model yang dibutuhkan dari database
const { User, Dosen, Mahasiswa, Lowongan, Perusahaan, PengajuanMagang, Dokumen, Feedback, Backup, Laporan, TemplateDokumen } = require('../../models');
const { Op } = require('sequelize'); // Untuk query yang lebih kompleks
const bcrypt = require('bcrypt'); // Untuk hashing password
const fs = require('fs');
const path = require('path');
const mysqldump = require('mysqldump'); // Ganti 'exec' dengan 'mysqldump'
const dbConfig = require('../../config/config.js')[process.env.NODE_ENV || 'development'];
const { Parser } = require('json2csv'); // Untuk export CSV

// Catatan: Setiap fungsi diekspor secara individual.

/**
 * @desc    Menampilkan halaman dashboard admin.
 * @route   GET /admin/dashboard
 */
exports.getDashboardPage = async (req, res) => {
    try {
        // Query untuk kartu statistik
        const [pengajuanBaru, mahasiswaAktif, perusahaanMitra, dosenPembimbing, tanpaPembimbing] = await Promise.all([
            PengajuanMagang.count({ where: { status: 'diajukan' } }),
            Mahasiswa.count(), // Hapus filter status_magang
            Perusahaan.count(),
            Dosen.count(),
            Mahasiswa.count({ where: { dosen_pembimbing_id: null } })
        ]);

        res.render('dashboard_admin', {
            stats: { pengajuanBaru, mahasiswaAktif, perusahaanMitra, dosenPembimbing, tanpaPembimbing },
            tugas: [], // Data ini bisa diisi dengan query lain
            aktivitas: [] // Data ini bisa diisi dengan query lain
        });
    } catch (error) {
        console.error("Error di getDashboardPage:", error);
        res.status(500).send('Terjadi kesalahan pada server');
    }
};

/**
 * @desc    Menampilkan halaman manajemen pengguna.
 * @route   GET /admin/manajemen-pengguna
 */
exports.getManajemenPenggunaPage = async (req, res) => {
     try {
        const { search, role } = req.query;
        const whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { username: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        if (role && role !== 'Semua Peran') {
            const dbRole = role === 'Mahasiswa' ? 'mahasiswa' :
                           role === 'Dosen Pembimbing' ? 'dosen' :
                           role === 'Admin Jurusan' ? 'admin' : null;
            if (dbRole) {
                whereClause.role = dbRole;
            }
        }

        const users = await User.findAll({
            where: whereClause,
            attributes: ['id', 'username', 'email', 'role', 'status', 'created_at'],
            order: [['created_at', 'DESC']]
        });
        
        // Transform data untuk menyesuaikan dengan template EJS
        const transformedUsers = users.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role === 'mahasiswa' ? 'Mahasiswa' : 
                  user.role === 'dosen' ? 'Dosen Pembimbing' : 
                  user.role === 'admin' ? 'Admin Jurusan' : user.role,
            status: user.status || 'Aktif'
        }));
        
        res.render('manajemen_pengguna', { 
            users: transformedUsers,
            currentSearch: search || '',
            currentRole: role || 'Semua Peran'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Terjadi kesalahan server');
    }
};

/**
 * @desc    Menambahkan pengguna baru.
 * @route   POST /admin/manajemen/pengguna
 */
exports.addUser = async (req, res) => {
    try {
        const { username, email, role, password } = req.body;
        
        // Validasi input
        if (!username || !email || !role || !password) {
            return res.status(400).json({ error: 'Semua field harus diisi' });
        }
        
        // Cek apakah email sudah ada
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email sudah terdaftar' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Transform role untuk database
        const dbRole = role === 'Mahasiswa' ? 'mahasiswa' : 
                      role === 'Dosen Pembimbing' ? 'dosen' : 
                      role === 'Admin Jurusan' ? 'admin' : role;
        
        // Buat user baru
        const newUser = await User.create({
            username,
            email,
            role: dbRole,
            password: hashedPassword,
            status: 'Aktif'
        });
        
        res.json({ success: true, message: 'Pengguna berhasil ditambahkan', user: newUser });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Gagal menambahkan pengguna' });
    }
};

/**
 * @desc    Mengubah status pengguna (aktif/nonaktif).
 * @route   PUT /admin/manajemen/pengguna/:id/status
 */
exports.updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
        }
        
        user.status = status;
        await user.save();
        
        res.json({ success: true, message: `Status pengguna berhasil diubah menjadi ${status}` });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Gagal mengubah status pengguna' });
    }
};

/**
 * @desc    Reset password pengguna.
 * @route   PUT /admin/manajemen/pengguna/:id/reset-password
 */
exports.resetUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { new_password } = req.body;
        
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
        }
        
        // Hash password baru
        const hashedPassword = await bcrypt.hash(new_password, 10);
        user.password = hashedPassword;
        await user.save();
        
        res.json({ success: true, message: 'Password berhasil direset' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Gagal reset password' });
    }
};

/**
 * @desc    Mengedit data pengguna.
 * @route   PUT /admin/manajemen/pengguna/:id
 */
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, role } = req.body;
        
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
        }
        
        // Cek apakah email sudah ada (kecuali untuk user yang sedang diedit)
        if (email !== user.email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ error: 'Email sudah terdaftar' });
            }
        }
        
        // Transform role untuk database
        const dbRole = role === 'Mahasiswa' ? 'mahasiswa' : 
                      role === 'Dosen Pembimbing' ? 'dosen' : 
                      role === 'Admin Jurusan' ? 'admin' : role;
        
        user.username = username;
        user.email = email;
        user.role = dbRole;
        await user.save();
        
        res.json({ success: true, message: 'Data pengguna berhasil diupdate' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Gagal mengupdate data pengguna' });
    }
};

/**
 * @desc    Menghapus pengguna.
 * @route   DELETE /admin/manajemen/pengguna/:id
 */
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
        }
        
        await user.destroy();
        
        res.json({ success: true, message: 'Pengguna berhasil dihapus' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Gagal menghapus pengguna' });
    }
};

/**
 * @desc    Menampilkan halaman manajemen dosen pembimbing.
 * @route   GET /admin/dosen-pembimbing
 */
exports.getDosenPembimbingPage = async (req, res) => {
    try {
        const dosenList = await Dosen.findAll({
            include: [{
                model: Mahasiswa,
                as: 'mahasiswaBimbingan',
                attributes: ['id', 'nim', 'nama'],
                include: [{
                    model: PengajuanMagang,
                    as: 'pengajuanMagangs',
                    where: { status: 'diterima' },
                    required: false,
                    include: [{
                        model: Lowongan,
                        as: 'lowongan'
                    }]
                }]
            }],
            order: [['nama', 'ASC']]
        });
        res.render('dosen_pembimbing', {
            dosenList: dosenList,
            semuaDosen: await Dosen.findAll({ order: [['nama', 'ASC']] }),
            mahasiswaTanpaDosen: await Mahasiswa.findAll({ where: { dosen_pembimbing_id: null } })
        });
    } catch (error) {
        console.error("Error saat mengambil data pembimbingan:", error);
        res.status(500).send('Terjadi kesalahan pada server');
    }
};

/**
 * @desc    Menangani proses alokasi dosen ke mahasiswa.
 * @route   POST /admin/alokasi-pembimbing
 */
exports.alokasikanPembimbing = async (req, res) => {
    try {
        const { mahasiswaId, dosenId } = req.body;
        if (!mahasiswaId || !dosenId) {
            return res.status(400).send('Mahasiswa dan Dosen harus dipilih.');
        }
        const mahasiswa = await Mahasiswa.findByPk(mahasiswaId);
        if (!mahasiswa) {
            return res.status(404).send('Mahasiswa tidak ditemukan.');
        }
        mahasiswa.dosen_pembimbing_id = dosenId;
        await mahasiswa.save();
        res.redirect('/admin/dosen-pembimbing');
    } catch (error) {
        console.error("Error saat mengalokasikan pembimbing:", error);
        res.status(500).send('Terjadi kesalahan pada server');
    }
};

/**
 * @desc    Menampilkan halaman progress magang.
 * @route   GET /admin/progress-magang
 */
exports.getProgressMagangPage = async (req, res) => {
    try {
        const { search, status, dosen, perusahaan } = req.query;

        // --- BUAT KONDISI FILTER DINAMIS UNTUK SEQUELIZE ---
        const whereClause = {
            status: { [Op.or]: ['diterima', 'selesai'] } // Hanya tampilkan yang sudah diterima atau selesai
        };
        const mahasiswaWhereClause = {};
        const lowonganWhereClause = {};
        const dosenWhereClause = {};

        if (search) {
            mahasiswaWhereClause[Op.or] = [
                { nama: { [Op.like]: `%${search}%` } },
                { nim: { [Op.like]: `%${search}%` } }
            ];
        }

        if (status && status !== 'Semua Status Magang') {
            const dbStatus = status === 'Aktif Magang' ? 'diterima' : 'selesai';
            whereClause.status = dbStatus;
        }

        if (perusahaan && perusahaan !== 'Semua Perusahaan') {
            lowonganWhereClause.perusahaan = perusahaan;
        }

        if (dosen && dosen !== 'Semua Dosen') {
            dosenWhereClause.nama = dosen;
        }
        
        // --- QUERY UTAMA DENGAN FILTER (PENDEKATAN LEBIH FLEKSIBEL) ---
        const progressData = await PengajuanMagang.findAll({
            where: whereClause,
            include: [
                {
                    model: Mahasiswa,
                    as: 'mahasiswa',
                    where: mahasiswaWhereClause,
                    required: !!search, // Hanya INNER JOIN jika ada pencarian
                    include: [
                        {
                            model: Dosen,
                            as: 'dosen',
                            where: dosenWhereClause,
                            required: (dosen && dosen !== 'Semua Dosen'),
                            attributes: ['nama', 'nidn']
                        },
                        {
                            model: User,
                            as: 'user',
                            attributes: ['username']
                        }
                    ]
                },
                {
                    model: Lowongan,
                    as: 'lowongan',
                    where: lowonganWhereClause,
                    required: (perusahaan && perusahaan !== 'Semua Perusahaan'), // Hanya INNER JOIN jika ada filter perusahaan
                }
            ],
            order: [['tanggal_pengajuan', 'DESC']]
        });

        // Saring hasil untuk memastikan relasi tidak null (menjaga dari data yang tidak konsisten)
        const validProgressData = progressData.filter(p => p.mahasiswa && p.lowongan);

        // Query untuk data laporan, hanya untuk data yang valid
        const laporanMahasiswaIds = validProgressData.map(p => p.mahasiswa.id);
        const laporanData = await Laporan.findAll({
            where: { mahasiswaId: { [Op.in]: laporanMahasiswaIds } }
        });

        // Gabungkan data progress dengan data laporan
        const combinedData = validProgressData.map(pengajuan => {
            const laporan = laporanData.find(l => l.mahasiswaId === pengajuan.mahasiswa.id);
            
            return {
                id: pengajuan.id,
                nim: pengajuan.mahasiswa.nim,
                nama: pengajuan.mahasiswa.nama,
                perusahaan: pengajuan.lowongan.perusahaan,
                statusMagang: pengajuan.status === 'diterima' ? 'Aktif Magang' : 'Selesai',
                dosenPembimbing: pengajuan.mahasiswa.dosen ? pengajuan.mahasiswa.dosen.nama : 'Belum Dialokasikan',
                logbookStatus: 'Terisi', // Placeholder
                laporanStatus: laporan ? laporan.status : 'Belum Unggah',
                tanggalPengajuan: pengajuan.tanggal_pengajuan
            };
        });

        // --- STATISTIK & DROPDOWN (ini bisa tetap sama) ---
        const [mahasiswaAktif, telahSelesai, semuaDosen, semuaPerusahaan] = await Promise.all([
            PengajuanMagang.count({ where: { status: 'diterima' } }),
            PengajuanMagang.count({ where: { status: 'selesai' } }),
            Dosen.findAll({ attributes: ['nama'], order: [['nama', 'ASC']] }),
            Lowongan.findAll({
                attributes: ['perusahaan'],
                group: ['perusahaan'],
                order: [['perusahaan', 'ASC']]
            })
        ]);

        res.render('progress_magang', {
            progressList: combinedData,
            stats: {
                mahasiswaAktif,
                logbookBelumDiisi: mahasiswaAktif, // Placeholder
                laporanReview: 5, // Placeholder
                telahSelesai
            },
            filters: {
                semuaDosen: semuaDosen.map(d => d.nama),
                semuaPerusahaan: semuaPerusahaan.map(p => p.perusahaan),
                currentSearch: search || '',
                currentStatus: status || 'Semua Status Magang',
                currentDosen: dosen || 'Semua Dosen',
                currentPerusahaan: perusahaan || 'Semua Perusahaan'
            }
        });
    } catch (error) {
        console.error("Error di getProgressMagangPage:", error);
        res.status(500).send('Terjadi kesalahan pada server');
    }
};

/**
 * @desc    Menampilkan halaman manajemen lowongan magang.
 * @route   GET /admin/lowongan-magang
 */
exports.getLowonganMagangPage = async (req, res) => {
    try {
        const lowonganList = await Lowongan.findAll({
            include: [{ model: PengajuanMagang, as: 'pengajuanMagangs', attributes: ['id'] }]
        });
        res.render('lowongan_magang', { lowonganList });
    } catch (error) {
        console.error("Error di getLowonganMagangPage:", error);
        res.status(500).send('Terjadi kesalahan pada server');
    }
};

/**
 * @desc    Menangani pembuatan lowongan baru. (Placeholder)
 * @route   POST /admin/lowongan-magang
 */
exports.buatLowonganMagang = async (req, res) => {
    try {
        // Logika untuk membuat lowongan baru dari req.body
        console.log('Membuat lowongan baru:', req.body);
        // await Lowongan.create({...});
        res.redirect('/admin/lowongan-magang');
    } catch (error) {
        console.error("Error di buatLowonganMagang:", error);
        res.status(500).send('Terjadi kesalahan pada server');
    }
};

/**
 * @desc    Mengubah format bytes menjadi ukuran yang mudah dibaca (KB, MB, GB).
 */
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * @desc    Menampilkan halaman manajemen backup.
 * @route   GET /admin/manajemen-backup
 */
exports.getManajemenBackupPage = async (req, res) => {
    try {
        const backups = await Backup.findAll({
            order: [['created_at', 'DESC']],
        });

        const formattedBackups = backups.map(b => ({
            id: b.id,
            fileName: b.fileName,
            description: b.description,
            createdAt: b.createdAt,
            fileSize: formatBytes(b.fileSize)
        }));

        res.render('manajemen_backup', { backups: formattedBackups });
    } catch (error) {
        console.error('Error fetching backups:', error);
        res.status(500).send('Gagal memuat halaman backup.');
    }
};

/**
 * @desc    Membuat file backup database baru.
 * @route   POST /admin/manajemen-backup/create
 */
exports.createBackup = async (req, res) => {
    const backupDir = path.join(__dirname, '..', '..', 'public', 'backups');
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    const fileName = `backup-${Date.now()}.sql`;
    const filePath = path.join(backupDir, fileName);
    const description = req.body.description || 'Backup Otomatis';

    try {
        // Gunakan package mysqldump
        await mysqldump({
            connection: {
                host: dbConfig.host,
                user: dbConfig.username,
                password: dbConfig.password,
                database: dbConfig.database,
            },
            dumpToFile: filePath,
        });

        // Lanjutkan untuk menyimpan info ke database
        const stats = fs.statSync(filePath);
        await Backup.create({
            fileName,
            filePath,
            fileSize: stats.size,
            description,
        });

        res.redirect('/admin/manajemen-backup');

    } catch (error) {
        console.error('Error creating backup:', error);
        res.status(500).send(`Gagal membuat backup: ${error.message}`);
    }
};

/**
 * @desc    Mengunduh file backup.
 * @route   GET /admin/manajemen-backup/:id/download
 */
exports.downloadBackup = async (req, res) => {
    try {
        const backup = await Backup.findByPk(req.params.id);
        if (!backup) {
            return res.status(404).send('File backup tidak ditemukan.');
        }
        res.download(backup.filePath, backup.fileName);
    } catch (error) {
        console.error('Error downloading backup:', error);
        res.status(500).send('Gagal mengunduh file.');
    }
};

/**
 * @desc    Menghapus file backup.
 * @route   POST /admin/manajemen-backup/:id/delete
 */
exports.deleteBackup = async (req, res) => {
    try {
        const backup = await Backup.findByPk(req.params.id);
        if (backup) {
            // Hapus file fisik
            if (fs.existsSync(backup.filePath)) {
                fs.unlinkSync(backup.filePath);
            }
            // Hapus record dari DB
            await backup.destroy();
        }
        res.redirect('/admin/manajemen-backup');
    } catch (error) {
        console.error('Error deleting backup:', error);
        res.status(500).send('Gagal menghapus backup.');
    }
};

/**
 * @desc    Export data progress magang ke CSV.
 * @route   GET /admin/progress-magang/export-csv
 */
exports.exportProgressMagangCSV = async (req, res) => {
    try {
        const { search, status, dosen, perusahaan } = req.query;
        
        // Query untuk mengambil data progress magang dengan semua relasi
        const progressData = await PengajuanMagang.findAll({
            where: {
                status: 'diterima' // Hanya pengajuan yang sudah diterima
            },
            include: [
                {
                    model: Mahasiswa,
                    as: 'mahasiswa',
                    include: [
                        {
                            model: Dosen,
                            as: 'dosen',
                            attributes: ['nama', 'nidn']
                        },
                        {
                            model: User,
                            as: 'user',
                            attributes: ['username']
                        }
                    ]
                },
                {
                    model: Lowongan,
                    as: 'lowongan',
                    include: [
                        {
                            model: Perusahaan,
                            as: 'detailPerusahaan',
                            attributes: ['nama', 'alamat']
                        }
                    ]
                }
            ],
            order: [['tanggal_pengajuan', 'DESC']]
        });

        // Query untuk data laporan
        const laporanData = await Laporan.findAll({
            include: [
                {
                    model: Mahasiswa,
                    as: 'mahasiswa',
                    attributes: ['id', 'nim', 'nama']
                }
            ]
        });

        // Gabungkan data progress dengan data laporan
        const combinedData = progressData
            .filter(pengajuan => pengajuan.mahasiswa && pengajuan.lowongan)
            .map(pengajuan => {
                const mahasiswaId = pengajuan.mahasiswa.id;
                const laporan = laporanData.find(l => l.mahasiswaId === mahasiswaId);
                
                return {
                    NIM: pengajuan.mahasiswa.nim,
                    'Nama Mahasiswa': pengajuan.mahasiswa.nama,
                    'Perusahaan': pengajuan.lowongan.perusahaan,
                    'Status Magang': pengajuan.status === 'diterima' ? 'Aktif Magang' : 
                                    pengajuan.status === 'selesai' ? 'Selesai' : pengajuan.status,
                    'Dosen Pembimbing': pengajuan.mahasiswa.dosen ? pengajuan.mahasiswa.dosen.nama : 'Belum Dialokasikan',
                    'Status Logbook': 'Terisi',
                    'Status Laporan': laporan ? laporan.status : 'Belum Unggah',
                    'Tanggal Pengajuan': pengajuan.tanggal_pengajuan
                };
            });

        // Filter data berdasarkan query parameters
        let filteredData = combinedData;
        
        if (search) {
            filteredData = filteredData.filter(item => 
                item['Nama Mahasiswa'].toLowerCase().includes(search.toLowerCase()) ||
                item.NIM.includes(search)
            );
        }
        
        if (status && status !== 'Semua Status Magang') {
            filteredData = filteredData.filter(item => item['Status Magang'] === status);
        }
        
        if (dosen && dosen !== 'Semua Dosen') {
            filteredData = filteredData.filter(item => item['Dosen Pembimbing'] === dosen);
        }
        
        if (perusahaan && perusahaan !== 'Semua Perusahaan') {
            filteredData = filteredData.filter(item => item['Perusahaan'] === perusahaan);
        }

        // Konfigurasi CSV
        const fields = [
            'NIM', 
            'Nama Mahasiswa', 
            'Perusahaan', 
            'Status Magang', 
            'Dosen Pembimbing', 
            'Status Logbook', 
            'Status Laporan', 
            'Tanggal Pengajuan'
        ];
        
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(filteredData);

        // Set header untuk download
        const filename = `progress-magang-${new Date().toISOString().split('T')[0]}.csv`;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        
        res.send(csv);
    } catch (error) {
        console.error("Error di exportProgressMagangCSV:", error);
        res.status(500).send('Terjadi kesalahan saat export CSV');
    }
};

// ===== FUNGSI LOWONGAN =====
exports.getLowongan = async (req, res) => {
  try {
    const lowongan = await Lowongan.findAll();
    
    const perusahaan = await Perusahaan.findAll({
      attributes: ['id', 'nama']
    });
    
    res.render('lowongan_magang', {
      lowongan,
      perusahaan,
      currentPage: 'lowongan',
      messages: req.flash()
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Gagal mengambil data lowongan.');
  }
};

exports.tambahLowongan = async (req, res) => {
  try {
    // Ambil semua data dari form
    const { 
      perusahaan, 
      judul,
      lokasi, 
      durasi, 
      deskripsi,
      kualifikasi,
      tanggal_dibuka,
      tanggal_ditutup,
      link_berkas
    } = req.body;
    
    // Validasi input
    if (!perusahaan || !judul || !lokasi || !durasi) {
      req.flash('error', 'Perusahaan, judul, lokasi, dan durasi harus diisi.');
      return res.redirect('/admin/lowongan-magang');
    }
    
    await Lowongan.create({
      perusahaan,
      judul,
      lokasi,
      durasi,
      deskripsi,
      kualifikasi,
      tanggal_dibuka,
      tanggal_ditutup,
      link_berkas
    });
    
    req.flash('success', 'Lowongan berhasil ditambahkan.');
    res.redirect('/admin/lowongan-magang');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal menambahkan lowongan.');
    res.redirect('/admin/lowongan-magang');
  }
};

exports.hapusLowongan = async (req, res) => {
  try {
    const id = req.params.id;
    await Lowongan.destroy({ where: { id } });
    req.flash('success', 'Lowongan berhasil dihapus.');
    res.redirect('/admin/lowongan-magang');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal menghapus lowongan.');
    res.redirect('/admin/lowongan-magang');
  }
};

// ===== FUNGSI MITRA PERUSAHAAN =====
exports.getMitra = async (req, res) => {
  try {
    const mitra = await Perusahaan.findAll();
    res.render('mitra_perusahaan', {
      mitra,
      currentPage: 'mitra',
      messages: req.flash()
    });
  } catch (err) {
    console.error("❌ Error ambil mitra:", err);
    res.status(500).send("Gagal ambil data mitra.");
  }
};

exports.tambahMitra = async (req, res) => {
  try {
    const { nama, alamat, email, telepon, pic } = req.body;
    
    // Validasi input
    if (!nama) {
      req.flash('error', 'Nama perusahaan harus diisi.');
      return res.redirect('/admin/mitra-perusahaan');
    }
    
    await Perusahaan.create({ 
      nama, 
      alamat: alamat || null,
      email: email || null,
      telepon: telepon || null,
      pic: pic || null
    });
    
    req.flash('success', 'Mitra perusahaan berhasil ditambahkan.');
    res.redirect('/admin/mitra-perusahaan');
  } catch (err) {
    console.error("❌ Error tambah mitra:", err);
    req.flash('error', 'Gagal menambahkan mitra perusahaan.');
    res.redirect('/admin/mitra-perusahaan');
  }
};

exports.hapusMitra = async (req, res) => {
  try {
    const id = req.params.id;
    await Perusahaan.destroy({ where: { id } });
    req.flash('success', 'Mitra perusahaan berhasil dihapus.');
    res.redirect('/admin/mitra-perusahaan');
  } catch (err) {
    console.error("❌ Error hapus mitra:", err);
    req.flash('error', 'Gagal menghapus mitra perusahaan.');
    res.redirect('/admin/mitra-perusahaan');
  }
};

exports.editMitra = async (req, res) => {
  try {
    const { id, nama, alamat, email, telepon, pic } = req.body;
    
    // Validasi input
    if (!nama) {
      req.flash('error', 'Nama perusahaan harus diisi.');
      return res.redirect('/admin/mitra-perusahaan');
    }
    
    const perusahaan = await Perusahaan.findByPk(id);
    if (!perusahaan) {
      req.flash('error', 'Perusahaan tidak ditemukan.');
      return res.redirect('/admin/mitra-perusahaan');
    }
    
    await perusahaan.update({
      nama,
      alamat: alamat || null,
      email: email || null,
      telepon: telepon || null,
      pic: pic || null
    });
    
    req.flash('success', 'Data mitra perusahaan berhasil diperbarui.');
    res.redirect('/admin/mitra-perusahaan');
  } catch (err) {
    console.error("❌ Error edit mitra:", err);
    req.flash('error', 'Gagal mengedit mitra perusahaan.');
    res.redirect('/admin/mitra-perusahaan');
  }
};

// ===== FUNGSI PENGUMUMAN =====
exports.getPengumumanPage = async (req, res) => {
    try {
        // Ambil semua pengumuman dari database
        const pengumuman = await Pengumuman.findAll({
            include: [
                {
                    model: User,
                    as: 'Admin',
                    attributes: ['username']
                }
            ],
            order: [['tanggal', 'DESC']]
        });

        res.render('pengumuman_admin', { 
            pengumuman: pengumuman,
            title: 'Manajemen Pengumuman'
        });
    } catch (error) {
        console.error('Error in getPengumumanPage:', error);
        res.status(500).send('Terjadi kesalahan saat memuat halaman pengumuman.');
    }
};

exports.savePengumuman = async (req, res) => {
    try {
        const { judul, tanggal, waktu, isi, kategori, ditujukan_kepada } = req.body;
        const adminUserId = req.user ? req.user.id : 1; // Fallback ke ID 1 untuk testing

        // Validasi input
        if (!judul || !tanggal || !isi || !ditujukan_kepada) {
            return res.status(400).json({ 
                success: false, 
                message: 'Judul, tanggal, isi, dan target pengumuman harus diisi' 
            });
        }

        // Gabungkan tanggal dan waktu
        const tanggalWaktu = waktu ? `${tanggal} ${waktu}:00` : tanggal;

        // Handle file upload
        let lampiranPath = null;
        if (req.file) {
            lampiranPath = `/uploads/pengumuman/${req.file.filename}`;
        }

        // Simpan pengumuman baru
        await Pengumuman.create({
            admin_user_id: adminUserId,
            judul: judul,
            isi: isi,
            tanggal: tanggalWaktu,
            ditujukan_kepada: ditujukan_kepada || 'semua',
            lampiran: lampiranPath
        });

        res.json({ 
            success: true, 
            message: 'Pengumuman berhasil disimpan' 
        });
    } catch (error) {
        console.error('Error in savePengumuman:', error);
        
        // Handle multer errors
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                success: false, 
                message: 'Ukuran file terlalu besar. Maksimal 5MB.' 
            });
        }
        
        if (error.message && error.message.includes('Hanya file')) {
            return res.status(400).json({ 
                success: false, 
                message: error.message 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat menyimpan pengumuman' 
        });
    }
};

exports.updatePengumuman = async (req, res) => {
    try {
        const { id, judul, tanggal, waktu, isi, kategori, ditujukan_kepada } = req.body;

        const pengumuman = await Pengumuman.findByPk(id);

        if (!pengumuman) {
            return res.status(404).json({ 
                success: false, 
                message: 'Pengumuman tidak ditemukan' 
            });
        }

        // Gabungkan tanggal dan waktu
        const tanggalWaktu = waktu ? `${tanggal} ${waktu}:00` : tanggal;

        // Handle file upload
        let lampiranPath = pengumuman.lampiran; // Keep existing lampiran if no new file
        if (req.file) {
            lampiranPath = `/uploads/pengumuman/${req.file.filename}`;
        }

        // Update pengumuman
        await pengumuman.update({
            judul: judul,
            isi: isi,
            tanggal: tanggalWaktu,
            ditujukan_kepada: ditujukan_kepada || 'semua',
            lampiran: lampiranPath
        });

        res.json({ 
            success: true, 
            message: 'Pengumuman berhasil diupdate' 
        });
    } catch (error) {
        console.error('Error in updatePengumuman:', error);
        
        // Handle multer errors
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                success: false, 
                message: 'Ukuran file terlalu besar. Maksimal 5MB.' 
            });
        }
        
        if (error.message && error.message.includes('Hanya file')) {
            return res.status(400).json({ 
                success: false, 
                message: error.message 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat mengupdate pengumuman' 
        });
    }
};

exports.deletePengumuman = async (req, res) => {
    try {
        const { id } = req.params;

        const pengumuman = await Pengumuman.findByPk(id);

        if (!pengumuman) {
            return res.status(404).json({ 
                success: false, 
                message: 'Pengumuman tidak ditemukan' 
            });
        }

        await pengumuman.destroy();

        res.json({ 
            success: true, 
            message: 'Pengumuman berhasil dihapus' 
        });
    } catch (error) {
        console.error('Error in deletePengumuman:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat menghapus pengumuman' 
        });
    }
};

exports.getAllPengumuman = async (req, res) => {
    try {
        const pengumuman = await Pengumuman.findAll({
            include: [
                {
                    model: User,
                    as: 'Admin',
                    attributes: ['username']
                }
            ],
            order: [['tanggal', 'DESC']]
        });

        res.json({ 
            success: true, 
            data: pengumuman 
        });
    } catch (error) {
        console.error('Error in getAllPengumuman:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat mengambil data pengumuman' 
        });
    }
};

// ===== FUNGSI LAPORAN STATISTIK =====
exports.getLaporanStatistik = async (req, res) => {
  try {
    // Statistik utama
    const totalMahasiswa = await Mahasiswa.count();
    const totalPerusahaan = await Perusahaan.count();
    const totalLowongan = await Lowongan.count();
    const totalPengajuan = await PengajuanMagang.count();

    // Statistik status pengajuan
    const pengajuanDiajukan = await PengajuanMagang.count({ where: { status: 'diajukan' } });
    const pengajuanDiterima = await PengajuanMagang.count({ where: { status: 'diterima' } });
    const pengajuanDitolak = await PengajuanMagang.count({ where: { status: 'ditolak' } });

    // Top perusahaan (sederhana)
    const topPerusahaan = await Perusahaan.findAll({
      limit: 5
    });

    // Statistik per jurusan (sederhana)
    const mahasiswaPerJurusan = await Mahasiswa.findAll({
      attributes: ['jurusan'],
      raw: true
    });

    const statistikJurusan = [];
    const jurusanCount = {};
    mahasiswaPerJurusan.forEach(m => {
      jurusanCount[m.jurusan] = (jurusanCount[m.jurusan] || 0) + 1;
    });

    Object.keys(jurusanCount).forEach(jurusan => {
      statistikJurusan.push({
        jurusan,
        jumlahMahasiswa: jurusanCount[jurusan],
        jumlahPengajuan: 0 // Sementara 0, bisa dihitung nanti
      });
    });

    // Data pengajuan untuk tabel detail
    const pengajuanList = await PengajuanMagang.findAll({
      include: [
        {
          model: Mahasiswa,
          as: 'mahasiswa',
          attributes: ['nama']
        },
        {
          model: Lowongan,
          as: 'lowongan',
          attributes: ['judul', 'perusahaan']
        }
      ],
      order: [['tanggal_pengajuan', 'DESC']],
      limit: 10
    });

    // Data tren bulanan (dummy data untuk contoh)
    const trendData = [12, 19, 15, 25, 22, 30];

    // Format data untuk view
    const stats = {
      totalMahasiswa,
      totalPerusahaan,
      totalLowongan,
      totalPengajuan,
      pengajuanDiajukan,
      pengajuanDiterima,
      pengajuanDitolak
    };

    const formattedTopPerusahaan = topPerusahaan.map(p => ({
      nama: p.nama,
      jumlahLowongan: 0, // Sementara 0
      jumlahPengajuan: 0 // Sementara 0
    }));

    const formattedPengajuanList = pengajuanList.map(p => ({
      namaMahasiswa: p.mahasiswa ? p.mahasiswa.nama : 'N/A',
      namaPerusahaan: p.lowongan ? p.lowongan.perusahaan : 'N/A',
      judulLowongan: p.lowongan ? p.lowongan.judul : 'N/A',
      tanggal: p.tanggal_pengajuan ? new Date(p.tanggal_pengajuan).toLocaleDateString('id-ID') : 'N/A',
      status: p.status
    }));

    res.render('laporan_statistik', {
      stats,
      topPerusahaan: formattedTopPerusahaan,
      statistikJurusan,
      pengajuanList: formattedPengajuanList,
      trendData
    });

  } catch (err) {
    console.error("❌ Error ambil laporan statistik:", err);
    res.status(500).send("Gagal mengambil laporan statistik.");
  }
};

exports.tambahFeedbackPerusahaan = async (req, res) => {
  try {
    const { namaMahasiswa, nim, perusahaan_id, tanggal, isi } = req.body;
    // Validasi input
    if (!namaMahasiswa || !nim || !perusahaan_id || !tanggal || !isi) {
      req.flash('error', 'Semua field harus diisi.');
      return res.redirect('/admin/feedback-perusahaan');
    }
    // Validasi format tanggal
    const tanggalObj = new Date(tanggal);
    if (isNaN(tanggalObj.getTime())) {
      req.flash('error', 'Format tanggal tidak valid.');
      return res.redirect('/admin/feedback-perusahaan');
    }
    await Feedback.create({
      namaMahasiswa: namaMahasiswa.trim(),
      nim: nim.trim(),
      perusahaan_id: parseInt(perusahaan_id),
      tanggal,
      isi: isi.trim()
    });
    req.flash('success', 'Feedback berhasil ditambahkan.');
    res.redirect('/admin/feedback-perusahaan');
  } catch (err) {
    console.error('Gagal menambah feedback:', err);
    req.flash('error', 'Gagal menambah feedback: ' + err.message);
    res.redirect('/admin/feedback-perusahaan');
  }
};

exports.getFeedbackPerusahaan = async (req, res) => {
  try {
    const feedback = await Feedback.findAll({ 
      order: [['tanggal', 'DESC']],
      include: [{ model: Perusahaan, as: 'perusahaanData', attributes: ['nama'] }]
    });
    const perusahaanList = await Perusahaan.findAll({ 
      attributes: ['id', 'nama'],
      order: [['nama', 'ASC']]
    });
    res.render('feedback_perusahaan', { 
      feedback, 
      perusahaanList, 
      messages: req.flash() 
    });
  } catch (err) {
    console.error('Gagal mengambil data feedback:', err);
    req.flash('error', 'Gagal mengambil data feedback.');
    res.render('feedback_perusahaan', { 
      feedback: [], 
      perusahaanList: [], 
      messages: req.flash() 
    });
  }
};

exports.hapusFeedbackPerusahaan = async (req, res) => {
  try {
    const id = req.params.id;
    await Feedback.destroy({ where: { id } });
    req.flash('success', 'Feedback berhasil dihapus.');
    res.redirect('/admin/feedback-perusahaan');
  } catch (err) {
    console.error('Gagal menghapus feedback:', err);
    req.flash('error', 'Gagal menghapus feedback.');
    res.redirect('/admin/feedback-perusahaan');
  }
};

/**
 * @desc    Menampilkan halaman pengajuan magang untuk admin.
 * @route   GET /admin/pengajuan-magang
 */
exports.getPengajuanMagangPage = async (req, res) => {
    try {
        const { search, status } = req.query;
        const whereClause = {};

        if (status && status !== 'Semua Status') {
            whereClause.status = status;
        }

        const pengajuanList = await PengajuanMagang.findAll({
            where: whereClause,
            include: [
                {
                    model: Mahasiswa,
                    as: 'mahasiswa',
                    where: search ? {
                        nama: { [Op.like]: `%${search}%` }
                    } : {},
                    required: !!search,
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['email']
                        },
                        {
                            model: Dosen,
                            as: 'dosen',
                            attributes: ['nama']
                        }
                    ]
                },
                {
                    model: Lowongan,
                    as: 'lowongan',
                    include: [
                        {
                            model: Perusahaan,
                            as: 'perusahaanData',
                            attributes: ['nama']
                        }
                    ]
                }
            ],
            order: [['tanggal_pengajuan', 'DESC']]
        });

        // Format data untuk view
        const formattedPengajuan = pengajuanList.map(pengajuan => ({
            id: pengajuan.id,
            nama: pengajuan.mahasiswa?.nama || 'Tidak diketahui',
            nim: pengajuan.mahasiswa?.nim || '-',
            email: pengajuan.mahasiswa?.user?.email || '-',
            dosen_pembimbing: pengajuan.mahasiswa?.dosen?.nama || 'Belum dialokasikan',
            perusahaan: pengajuan.lowongan?.perusahaanData?.nama || pengajuan.lowongan?.perusahaan || '-',
            posisi: pengajuan.lowongan?.deskripsi || '-',
            tanggal_pengajuan: new Date(pengajuan.tanggal_pengajuan).toLocaleDateString('id-ID'),
            status: pengajuan.status,
            cv: pengajuan.cv,
            transkrip: pengajuan.transkrip,
            krs: pengajuan.krs,
            dokumen_pendukung: pengajuan.dokumen_pendukung
        }));

        // Hitung statistik
        const total = pengajuanList.length;
        const menunggu = pengajuanList.filter(p => p.status === 'diajukan').length;
        const diterima = pengajuanList.filter(p => p.status === 'diterima').length;
        const ditolak = pengajuanList.filter(p => p.status === 'ditolak').length;

        res.render('pengajuan_magang', {
            pengajuan: formattedPengajuan,
            stats: { total, menunggu, diterima, ditolak },
            currentSearch: search || '',
            currentStatus: status || 'Semua Status'
        });
    } catch (error) {
        console.error('Error in getPengajuanMagangPage:', error);
        res.status(500).send('Terjadi kesalahan saat memuat halaman pengajuan magang.');
    }
};

/**
 * @desc    Verifikasi pengajuan magang (approve/reject).
 * @route   POST /admin/pengajuan/verifikasi/:id
 */
exports.verifikasiPengajuan = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, catatan } = req.body;

        if (!status || !['diterima', 'ditolak'].includes(status)) {
            req.flash('error', 'Status verifikasi tidak valid.');
            return res.redirect('/admin/pengajuan-magang');
        }

        const pengajuan = await PengajuanMagang.findByPk(id);
        if (!pengajuan) {
            req.flash('error', 'Pengajuan tidak ditemukan.');
            return res.redirect('/admin/pengajuan-magang');
        }

        // Update status pengajuan
        await pengajuan.update({
            status: status,
            keterangan: catatan || null,
            tanggal_verifikasi: new Date()
        });

        const statusText = status === 'diterima' ? 'disetujui' : 'ditolak';
        req.flash('success', `Pengajuan magang berhasil ${statusText}.`);
        
        res.redirect('/admin/pengajuan-magang');
    } catch (error) {
        console.error('Error in verifikasiPengajuan:', error);
        req.flash('error', 'Terjadi kesalahan saat memverifikasi pengajuan.');
        res.redirect('/admin/pengajuan-magang');
    }
};

/**
 * @desc    Menampilkan detail pengajuan magang untuk admin.
 * @route   GET /admin/pengajuan/:id/detail
 */
exports.getDetailPengajuanAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const pengajuan = await PengajuanMagang.findByPk(id, {
            include: [
                {
                    model: Mahasiswa,
                    as: 'mahasiswa',
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['email']
                        },
                        {
                            model: Dosen,
                            as: 'dosen',
                            attributes: ['nama']
                        }
                    ]
                },
                {
                    model: Lowongan,
                    as: 'lowongan',
                    include: [
                        {
                            model: Perusahaan,
                            as: 'perusahaanData',
                            attributes: ['nama', 'alamat', 'email', 'telepon']
                        }
                    ]
                }
            ]
        });

        if (!pengajuan) {
            return res.status(404).send('Pengajuan tidak ditemukan.');
        }

        const detail = {
            id: pengajuan.id,
            nama: pengajuan.mahasiswa?.nama || 'Tidak diketahui',
            nim: pengajuan.mahasiswa?.nim || '-',
            email: pengajuan.mahasiswa?.user?.email || '-',
            dosen_pembimbing: pengajuan.mahasiswa?.dosen?.nama || 'Belum dialokasikan',
            perusahaan: pengajuan.lowongan?.perusahaanData?.nama || pengajuan.lowongan?.perusahaan || '-',
            alamat_perusahaan: pengajuan.lowongan?.perusahaanData?.alamat || '-',
            email_perusahaan: pengajuan.lowongan?.perusahaanData?.email || '-',
            telepon_perusahaan: pengajuan.lowongan?.perusahaanData?.telepon || '-',
            posisi: pengajuan.lowongan?.deskripsi || '-',
            lokasi: pengajuan.lowongan?.lokasi || '-',
            durasi: pengajuan.lowongan?.durasi || '-',
            tanggal_pengajuan: new Date(pengajuan.tanggal_pengajuan).toLocaleDateString('id-ID'),
            status: pengajuan.status,
            keterangan: pengajuan.keterangan || 'Tidak ada catatan',
            cv: pengajuan.cv,
            transkrip: pengajuan.transkrip,
            krs: pengajuan.krs,
            dokumen_pendukung: pengajuan.dokumen_pendukung
        };

        res.render('detail_pengajuan_admin', { detail });
    } catch (error) {
        console.error('Error in getDetailPengajuanAdmin:', error);
        res.status(500).send('Terjadi kesalahan saat memuat detail pengajuan.');
    }
};

/**
 * @desc    Menampilkan halaman template dokumen untuk admin.
 * @route   GET /admin/template-dokumen
 */
exports.getTemplateDokumenPage = async (req, res) => {
    try {
        const templates = await TemplateDokumen.findAll({
            order: [['created_at', 'DESC']]
        });

        res.render('template_dokumen', { 
            templates: templates,
            title: 'Manajemen Template Dokumen',
            messages: req.flash()
        });
    } catch (error) {
        console.error('Error in getTemplateDokumenPage:', error);
        req.flash('error', 'Terjadi kesalahan saat memuat halaman template dokumen.');
        res.redirect('/admin/dashboard');
    }
};

/**
 * @desc    Menambah template dokumen baru.
 * @route   POST /admin/template-dokumen/tambah
 */
exports.tambahTemplateDokumen = async (req, res) => {
    try {
        const { nama, deskripsi } = req.body;
        const file = req.file;

        if (!file) {
            req.flash('error', 'File template harus diupload.');
            return res.redirect('/admin/template-dokumen');
        }

        // Validasi file type
        const allowedTypes = ['.doc', '.docx', '.pdf'];
        const fileExtension = path.extname(file.originalname).toLowerCase();
        if (!allowedTypes.includes(fileExtension)) {
            req.flash('error', 'Tipe file tidak didukung. Gunakan .doc, .docx, atau .pdf');
            return res.redirect('/admin/template-dokumen');
        }

        // Buat direktori jika belum ada
        const uploadDir = path.join(__dirname, '../../public/files/templates');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const fileName = `${timestamp}-${file.originalname}`;
        const filePath = path.join(uploadDir, fileName);

        // Move file to destination
        fs.renameSync(file.path, filePath);

        // Save to database
        await TemplateDokumen.create({
            nama: nama,
            deskripsi: deskripsi || '',
            file_path: `/files/templates/${fileName}`,
            file_name: file.originalname,
            file_size: file.size,
            file_type: fileExtension,
            created_by: req.session.userId || 1
        });

        req.flash('success', 'Template dokumen berhasil ditambahkan.');
        res.redirect('/admin/template-dokumen');

    } catch (error) {
        console.error('Error in tambahTemplateDokumen:', error);
        req.flash('error', 'Terjadi kesalahan saat menambah template dokumen.');
        res.redirect('/admin/template-dokumen');
    }
};

/**
 * @desc    Mengupdate template dokumen.
 * @route   PUT /admin/template-dokumen/update/:id
 */
exports.updateTemplateDokumen = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama, deskripsi, status } = req.body;
        const file = req.file;

        const template = await TemplateDokumen.findByPk(id);
        if (!template) {
            return res.status(404).json({ success: false, message: 'Template tidak ditemukan.' });
        }

        // Update basic info
        template.nama = nama;
        template.deskripsi = deskripsi || '';
        template.status = status || 'aktif';
        template.updated_by = req.session.userId || 1;

        // If new file is uploaded
        if (file) {
            // Validasi file type
            const allowedTypes = ['.doc', '.docx', '.pdf'];
            const fileExtension = path.extname(file.originalname).toLowerCase();
            if (!allowedTypes.includes(fileExtension)) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Tipe file tidak didukung. Gunakan .doc, .docx, atau .pdf' 
                });
            }

            // Delete old file
            const oldFilePath = path.join(__dirname, '../../public', template.file_path);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }

            // Save new file
            const uploadDir = path.join(__dirname, '../../public/files/templates');
            const timestamp = Date.now();
            const fileName = `${timestamp}-${file.originalname}`;
            const newFilePath = path.join(uploadDir, fileName);

            fs.renameSync(file.path, newFilePath);

            // Update file info
            template.file_path = `/files/templates/${fileName}`;
            template.file_name = file.originalname;
            template.file_size = file.size;
            template.file_type = fileExtension;
        }

        await template.save();

        res.json({ success: true, message: 'Template dokumen berhasil diupdate.' });

    } catch (error) {
        console.error('Error in updateTemplateDokumen:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengupdate template dokumen.' });
    }
};

/**
 * @desc    Menghapus template dokumen.
 * @route   DELETE /admin/template-dokumen/delete/:id
 */
exports.deleteTemplateDokumen = async (req, res) => {
    try {
        const { id } = req.params;

        const template = await TemplateDokumen.findByPk(id);
        if (!template) {
            return res.status(404).json({ success: false, message: 'Template tidak ditemukan.' });
        }

        // Delete file from filesystem
        const filePath = path.join(__dirname, '../../public', template.file_path);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete from database
        await template.destroy();

        res.json({ success: true, message: 'Template dokumen berhasil dihapus.' });

    } catch (error) {
        console.error('Error in deleteTemplateDokumen:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menghapus template dokumen.' });
    }
};

/**
 * @desc    Download template dokumen.
 * @route   GET /admin/template-dokumen/download/:id
 */
exports.downloadTemplateDokumen = async (req, res) => {
    try {
        const { id } = req.params;

        const template = await TemplateDokumen.findByPk(id);
        if (!template) {
            req.flash('error', 'Template tidak ditemukan.');
            return res.redirect('/admin/template-dokumen');
        }

        const filePath = path.join(__dirname, '../../public', template.file_path);
        
        if (!fs.existsSync(filePath)) {
            req.flash('error', 'File template tidak ditemukan.');
            return res.redirect('/admin/template-dokumen');
        }

        res.download(filePath, template.file_name);

    } catch (error) {
        console.error('Error in downloadTemplateDokumen:', error);
        req.flash('error', 'Terjadi kesalahan saat download template.');
        res.redirect('/admin/template-dokumen');
    }
};

/**
 * @desc    Get template dokumen by ID for edit.
 * @route   GET /admin/template-dokumen/:id
 */
exports.getTemplateDokumenById = async (req, res) => {
    try {
        const { id } = req.params;

        const template = await TemplateDokumen.findByPk(id);
        if (!template) {
            return res.status(404).json({ success: false, message: 'Template tidak ditemukan.' });
        }

        res.json({ success: true, data: template });

    } catch (error) {
        console.error('Error in getTemplateDokumenById:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengambil data template.' });
    }
};
