import { Schema, Document, model } from "mongoose";

export interface IGenreDocument extends Document {
  name: string;
  createdAt: Date;
  isBlocked:boolean;
}

const GenreSchema = new Schema<IGenreDocument>({
  name: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  isBlocked: { type: Boolean, default: false }, 
});


const GenreModel = model<IGenreDocument>("Genre", GenreSchema);
export default GenreModel
