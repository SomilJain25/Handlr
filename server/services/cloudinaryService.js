const cloudinary = require('../config/cloudinary');

/**
 * Uploads a Buffer (from multer memoryStorage) to Cloudinary via a stream,
 * avoiding any temp files on disk.
 */
const streamUpload = (buffer, folder, resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `handlr/${folder}`, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

const deleteAsset = async (publicId, resourceType = 'image') => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

module.exports = { streamUpload, deleteAsset };