import multer from 'multer';

const storage = multer.memoryStorage();

console.log("multer")
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

export default upload;
