import express from 'express';
import upload from '../middlewares/uploadMiddleware';
import { uploadTrack } from '../controllers/TrackController';

const router = express.Router();

// Route to upload a song
router.post('/upload', upload.fields([{ name: 'song', maxCount: 1 }, { name: 'image', maxCount: 1 }]), uploadTrack);

export default router;
