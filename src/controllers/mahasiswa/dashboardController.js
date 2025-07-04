const db = require('../../../models');
const Mahasiswa = db.Mahasiswa;

const getDashboard = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const mahasiswa = await Mahasiswa.findOne({ where: { user_id: userId } });
    res.render('dashboard-mahasiswa', {
      title: 'Dashboard Mahasiswa',
      mahasiswa
    });
  } catch (error) {
    console.error('Error in getDashboard:', error);
    res.status(500).render('error', {
      message: 'Terjadi kesalahan saat memuat dashboard',
      error: error
    });
  }
};

module.exports = {
  getDashboard
};

