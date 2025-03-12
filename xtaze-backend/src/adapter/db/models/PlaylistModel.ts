import mongoose from "mongoose";

const PlaylistSchema = new mongoose.Schema({
  title: String,
  description: String,
  imageUrl: String,
  trackCount: Number,
  createdBy: { type: String }, 
  tracks: [{ type: String }],
});

const PlaylistModel = mongoose.model("Playlist", PlaylistSchema);
export default PlaylistModel
