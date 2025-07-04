const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Pastikan folder uploads dan subfolder ada
const uploadsDir = 'public/uploads';
const pengumumanDir = 'public/uploads/pengumuman';

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(pengumumanDir)) {
  fs.mkdirSync(pengumumanDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Pastikan folder 'uploads' sudah ada
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Storage khusus untuk pengumuman
const pengumumanStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, pengumumanDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });
const uploadPengumuman = multer({ 
  storage: pengumumanStorage,
  fileFilter: function (req, file, cb) {
    // Izinkan file PDF, DOC, DOCX, dan gambar
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Hanya file PDF, DOC, DOCX, dan gambar yang diperbolehkan!'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Configuration for template dokumen uploads
const storageTemplateDokumen = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/files/templates/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const uploadTemplateDokumen = multer({
    storage: storageTemplateDokumen,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['.doc', '.docx', '.pdf'];
        const fileExtension = path.extname(file.originalname).toLowerCase();
        
        if (allowedTypes.includes(fileExtension)) {
            cb(null, true);
        } else {
            cb(new Error('Tipe file tidak didukung. Gunakan .doc, .docx, atau .pdf'), false);
        }
    }
});

module.exports = {
    upload,
    uploadPengumuman,
    uploadTemplateDokumen
};