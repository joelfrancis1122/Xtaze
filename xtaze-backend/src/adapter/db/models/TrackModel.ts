import mongoose, { Schema, Document } from "mongoose";

export interface ITrack extends Document {
  title: string;
  genre: string[];
  album: string;
  fileUrl: string;
  img: string;
  createdAt: Date;
  listeners?: number;
  artists: string[]; 
  playHistory?: { month: string; plays: number }[]; // Monthly play history
}

const TrackSchema = new Schema<ITrack>({
  title: { type: String, required: true },
  genre: { type: [String], required: true },
  album: { type: String, required: true },
  fileUrl: { type: String, required: true },
  img: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  listeners: { type: Number, default: 0 },
  artists: { type: [String], required: true }, 
  playHistory: [
    {
      month: { type: String, required: true }, 
      plays: { type: Number, default: 0 },
    },
  ],
});

export const Track = mongoose.model<ITrack>("Track", TrackSchema);
