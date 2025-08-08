import mongoose, { Schema, Document } from "mongoose";

export interface ITrack extends Document {
  title: string;
  genre: string[];
  albumId: string;
  fileUrl: string;
  img: string;
  createdAt: Date;
  listeners?: string[];
  artists: string[];
  playHistory?: { month: string; plays: number }[]; 
}

const TrackSchema = new Schema<ITrack>({
  title: { type: String, required: true },
  genre: { type: [String], required: true },
  albumId: { type: String, required: true },
  fileUrl: { type: String, required: true },
  img: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  listeners: { type: [String], default: [] },
  artists: { type: [String], required: true },
  playHistory: [
    {
      month: { type: String, required: true },
      plays: { type: Number, default: 0 },
      paymentStatus: { type: Boolean, default: false }
    },
  ],

}, {
  suppressReservedKeysWarning: true,
});

export const Track = mongoose.model<ITrack>("Track", TrackSchema);
