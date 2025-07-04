const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

router.get('/login', authController.showLoginPage);
router.post('/login', authController.handleLogin);

router.get('/register', authController.showRegisterPage);
router.post('/register', authController.handleRegister);

router.get('/dashboard', isAuthenticated, (req, res) => {
  res.render('dashboard-mahasiswa', { user: req.session.user });
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
