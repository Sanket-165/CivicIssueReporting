const multer = require('multer');
const path = require('path');
const { supabase } = require('../config/db');

// ---------- Multer Setup ----------
// Use memory storage to keep files in memory before uploading to Supabase
const storage = multer.memoryStorage();

// Allowed file types (images, audio, video)
const allowedFileTypes = /jpeg|jpg|png|gif|mp3|wav|m4a|mp4|webm/;

// Check file type function
function checkFileType(file, cb) {
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only Images, Audio, or Video files are allowed!'));
  }
}

// Multer instance
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => checkFileType(file, cb),
});

// ---------- Supabase Upload Function ----------
/**
 * Uploads a file to Supabase Storage and returns its public URL
 * @param {Object} file - Multer file object
 * @param {string} folder - Storage folder name
 * @param {string} bucketName - Supabase storage bucket name
 * @returns {string} - Public URL of uploaded file
 */
const uploadToSupabase = async (file, folder = 'uploads', bucketName = 'your-bucket-name') => {
  if (!file) return null;

  // Generate unique file name
  const fileExt = path.extname(file.originalname);
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  // Upload file to Supabase
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file.buffer, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.mimetype,
    });

  if (error) throw error;

  // Get public URL
  const { publicUrl, error: urlError } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  if (urlError) throw urlError;

  return publicUrl;
};

module.exports = { upload, uploadToSupabase };
