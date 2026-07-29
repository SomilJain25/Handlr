const express = require('express');
const protect = require('../middleware/protect');
const { uploadImage, uploadResume, uploadProjectFile } = require('../middleware/upload');
const {
  uploadAvatarFile,
  uploadResumeFile,
  uploadPortfolioImageFile,
  uploadCompanyLogoFile,
  uploadProjectFileFile,
} = require('../controllers/uploadController');

const router = express.Router();

// All upload routes require a logged-in user.
router.post('/avatar', protect, uploadImage.single('file'), uploadAvatarFile);
router.post('/resume', protect, uploadResume.single('file'), uploadResumeFile);
router.post(
  '/portfolio-image',
  protect,
  uploadImage.single('file'),
  uploadPortfolioImageFile
);
router.post(
  '/company-logo',
  protect,
  uploadImage.single('file'),
  uploadCompanyLogoFile
);
router.post(
  '/proposal-attachment',
  protect,
  uploadProjectFile.single('file'),
  uploadProjectFileFile
);

// Multer error handler (file too large, wrong type, etc.)
router.use((err, req, res, next) => {
  if (err) return res.status(400).json({ error: err.message });
  next();
});

module.exports = router;