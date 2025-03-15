import { Schema, Document, model } from "mongoose";
import { IPlaylist } from "../../../domain/entities/IPlaylist";

export interface IPlaylistDocument extends IPlaylist, Document {}

const PlaylistSchema = new Schema<IPlaylistDocument>(
  {
    title: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
    trackCount: { type: Number, default: 0 },
    createdBy: { type: String },
    tracks: { type: [String], default: [] },

  },
  { timestamps: true }
);

// Export Model
const PlaylistModel = model<IPlaylistDocument>("Playlist", PlaylistSchema);
export default PlaylistModel;
