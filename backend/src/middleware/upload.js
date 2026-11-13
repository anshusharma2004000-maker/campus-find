import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  if (/^image\/(jpeg|png|webp)$/.test(file.mimetype)) cb(null, true);
  else cb(Object.assign(new Error('Only JPG, PNG and WEBP images are allowed.'), { status: 400 }));
} });
export default upload;
