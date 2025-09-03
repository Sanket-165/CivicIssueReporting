const multer = require('multer');
const path = require('path');

// Use memory storage to avoid saving files to the server before uploading to Cloudinary
const storage = multer.memoryStorage();

function checkFileType(file, cb) {
 const filetypes = /jpeg|jpg|png|gif|mp3|wav|m4a|mp4|webm/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images or Audio Files Only!');
  }
}

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = upload;