const { streamUpload } = require('../services/cloudinaryService');

const handleUpload = (folder, resourceType) => async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided.' });
    }
    const result = await streamUpload(req.file.buffer, folder, resourceType);
    return res.status(200).json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (err) {
    console.error(`Upload failed (${folder}):`, err.message);
    return res.status(500).json({ error: err.message || 'Upload failed.' });
  }
};

// --- Per-upload-kind handlers, used directly by routes ---
const uploadAvatarFile = handleUpload('avatars', 'image');
const uploadResumeFile = handleUpload('resumes', 'raw');
const uploadPortfolioImageFile = handleUpload('portfolio', 'image');
const uploadCompanyLogoFile = handleUpload('company-logos', 'image');
const uploadProjectFileFile = handleUpload('project-files', 'auto');

module.exports = {
  uploadAvatarFile,
  uploadResumeFile,
  uploadPortfolioImageFile,
  uploadCompanyLogoFile,
  uploadProjectFileFile,
};