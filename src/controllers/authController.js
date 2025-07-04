const db = require('../../models');
const User = db.User;
const bcrypt = require('bcrypt');

exports.showLoginPage = (req, res) => {
  res.render('login', { error: null });
};

exports.handleLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.render('login', { error: 'Username tidak ditemukan.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('login', { error: 'Password salah.' });
    }

    // Simpan data user ke session
    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    // Redirect sesuai role
    if (user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    } else if (user.role === 'dosen') {
      return res.redirect('/dosen/dashboard');
    } else if (user.role === 'mahasiswa') {
      return res.redirect('/mahasiswa/dashboard');
    } else {
      return res.render('login', { error: 'Role tidak dikenali.' });
    }

  } catch (err) {
    console.error(err);
    res.status(500).send('Terjadi kesalahan server');
  }
};

exports.showRegisterPage = (req, res) => {
  res.render('register', { error: null });
};

exports.handleRegister = async (req, res) => {
  const { username, email, password, confirm_password, role } = req.body;

  // Validasi dasar
  if (!username || !email || !password || !confirm_password || !role) {
    return res.render('register', { error: 'Semua field harus diisi.' });
  }
  if (password !== confirm_password) {
    return res.render('register', { error: 'Password dan konfirmasi password tidak cocok.' });
  }
  if (password.length < 5) {
    return res.render('register', { error: 'Password minimal 5 karakter.' });
  }

  // Validasi field tambahan
  if (role === 'mahasiswa') {
    const { mhs_nama, nim, jurusan, angkatan, no_hp } = req.body;
    if (!mhs_nama || !nim || !jurusan || !angkatan || !no_hp) {
      return res.render('register', { error: 'Semua data mahasiswa wajib diisi.' });
    }
  } else if (role === 'dosen') {
    const { dsn_nama, nidn, telepon } = req.body;
    if (!dsn_nama || !nidn || !telepon) {
      return res.render('register', { error: 'Semua data dosen wajib diisi.' });
    }
  }

  try {
    // Cek email/username sudah terdaftar
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.render('register', { error: 'Email sudah terdaftar.' });
    }
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.render('register', { error: 'Username sudah terdaftar.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user baru
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
      status: 'Aktif'
    });

    // Tambahkan ke tabel mahasiswa/dosen jika perlu
    if (role === 'mahasiswa') {
      const { mhs_nama, nim, jurusan, angkatan, no_hp } = req.body;
      await db.Mahasiswa.create({
        user_id: newUser.id,
        nama: mhs_nama,
        nim,
        jurusan,
        angkatan,
        no_hp
      });
    } else if (role === 'dosen') {
      const { dsn_nama, nidn, telepon } = req.body;
      await db.Dosen.create({
        user_id: newUser.id,
        nama: dsn_nama,
        nidn,
        email,
        telepon
      });
    }

    // Redirect ke login setelah sukses daftar
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.render('register', { error: 'Terjadi kesalahan server.' });
  }
};
