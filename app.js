const express = require("express");
const session = require('express-session');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const path = require("path");
const sequelize = require('./src/config/sequelize'); // Impor instance Sequelize
const app = express(); // Inisialisasi aplikasi Express
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
const authRoutes = require('./src/routes/authRoutes');
app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');
// Konfigurasi View Engine (EJS)
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'rahasia-sesi-login',
  resave: false,
  saveUninitialized: true
}));
app.set("views", path.join(__dirname, "src/views"));

// Konfigurasi Flash Messages
app.use(flash());

// Middleware untuk membuat flash messages tersedia di semua view
app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
});

app.use('/', authRoutes);

// Middleware untuk parsing body dari form HTML (urlencoded) dan JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serving file statis (CSS, JS, gambar, dokumen dari folder public)
app.use(express.static(path.join(__dirname, "public")));

// Serving file uploads untuk lampiran pengumuman
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Middleware simulasi user login (harus sebelum rute yang membutuhkannya)
app.use((req, res, next) => {
    // Ini mensimulasikan user yang sudah login sebagai admin.
    // Penting: Sesuaikan ID ini dengan ID user 'andi' (role 'admin') yang ada di tabel `users` setelah seeding.
    // Berdasarkan seeder terakhir kita, 'andi' (admin) akan mendapatkan ID 1.
    // Menggunakan ID 1 karena seeder biasanya memberikan ID 1 untuk user pertama (andi).
    req.user = { id: 1, role: 'admin' }; 
    next();
});

// Impor dan gunakan rute-rute (harus setelah middleware dan sebelum app.listen)
const mahasiswaRoutes = require('./src/routes/mahasiswaRoutes');
app.use('/mahasiswa', mahasiswaRoutes);

const adminRoutes = require('./src/routes/adminRoutes');
app.use('/admin', adminRoutes);

const dospemRoutes = require('./src/routes/dospemRoutes');
app.use('/dospem', dospemRoutes);

// --- Route Halaman Utama dan Logout (harus sebelum app.listen) ---
app.get('/', (req, res) => {
    if (req.user && req.user.role === 'dosen') {
        return res.redirect('/dospem/dashboard');
    }
    // Jika tidak login atau bukan dosen, tampilkan halaman index umum
    res.render('index', { title: 'Selamat Datang di Sistem Magang' });
});

app.get('/logout', (req, res) => {
    req.user = null; // Menghapus user dummy
    res.redirect('/');
});

// Port untuk aplikasi
const PORT = process.env.PORT || 3000;

// Mulai server tanpa sinkronisasi otomatis
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
