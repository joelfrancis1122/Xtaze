import { Request, Response } from 'express';
import { uploadSongToCloud, uploadImageToCloud } from '../../infrastructure/services/CloudinaryService';
import { Track } from '../../infrastructure/db/models/TrackModel';
import { json } from 'stream/consumers';

// Upload a new track
export const uploadTrack = async (req: Request, res: Response): Promise<void> => {
  if (!req.files || !("song" in req.files) || !("image" in req.files)) {
    res.status(400).json({ message: "Both song and image must be uploaded" });
    return;
  }

  const songFile = (req.files as { [fieldname: string]: Express.Multer.File[] }).song[0];
  const imageFile = (req.files as { [fieldname: string]: Express.Multer.File[] }).image[0];

  try {
    console.log(req.body,"arisajdjaksdj")
    console.log(req.files,"arisajdjaksdj")
    const songResult = await uploadSongToCloud(songFile);
    const imageResult = await uploadImageToCloud(imageFile);

    const { title, genre, album, artists } = req.body;
    const artistArray = artists ? artists.split(",").map((artist: string) => artist.trim()) : [];

    if (artistArray.length === 0) {
      res.status(400).json({ message: "At least one artist must be provided" });
      return;
    }

    const newTrack = new Track({
      title,
      genre:JSON.parse(genre),
      album,
      fileUrl: songResult.secure_url,
      img: imageResult.secure_url,
      createdAt: new Date(),
      listeners: 0,
      artists: JSON.parse(artistArray), // Store multiple artists
    });

    await newTrack.save();

    res.status(200).json({
      message: "Song and image uploaded successfully, and track saved in MongoDB",
      songUrl: songResult.secure_url,
      imageUrl: imageResult.secure_url,
      track: newTrack,
    });
  } catch (error) {
    res.status(500).json({ message: "Error uploading files or saving to database", error });
  }
};
// Get all tracks (For home page)
export const getAllTracks = async (req: Request, res: Response): Promise<void> => {
  try {
    const tracks = await Track.find().sort({ createdAt: -1 }); // Fetch all tracks sorted by latest
    res.status(200).json(tracks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tracks', error });
  }
};
