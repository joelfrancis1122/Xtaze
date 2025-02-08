import multer from 'multer';

const storage = multer.memoryStorage(); // Store files in memory before uploading

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
});

export default upload;
