import mongoose, { Schema, Document, Types } from "mongoose";
import { IAlbum } from "../../../domain/entities/IAlbum";

interface IAlbumModel extends Omit<IAlbum, "_id">, Document {}

const AlbumSchema = new Schema<IAlbumModel>(
  {
    name: { type: String, required: true },
    description: { type: String },
    coverImage: { type: String },
    artistId: { type: String, ref: "Artist", required: true },
    tracks: [{ type: String, ref: "Track", default: [] }],
  },
  { timestamps: true } 
);

export const AlbumModel = mongoose.model<IAlbumModel>("Album", AlbumSchema);
