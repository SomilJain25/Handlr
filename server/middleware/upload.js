const multer = require('multer');

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const RESUME_TYPES = ['application/pdf'];
const PROJECT_FILE_TYPES = [...IMAGE_TYPES, ...RESUME_TYPES, 'application/zip'];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10MB

const storage = multer.memoryStorage();

const makeUploader = (allowedTypes, maxSize) =>
  multer({
    storage,
    limits: { fileSize: maxSize },
    fileFilter: (req, file, cb) => {
      if (!allowedTypes.includes(file.mimetype)) {
        return cb(
          new Error(`Unsupported file type: ${file.mimetype}. Allowed: ${allowedTypes.join(', ')}`)
        );
      }
      cb(null, true);
    },
  });

module.exports = {
  uploadImage: makeUploader(IMAGE_TYPES, MAX_IMAGE_SIZE), // avatar, company logo, portfolio image
  uploadResume: makeUploader(RESUME_TYPES, MAX_DOC_SIZE), // resume PDF
  uploadProjectFile: makeUploader(PROJECT_FILE_TYPES, MAX_DOC_SIZE), // completed work files
};