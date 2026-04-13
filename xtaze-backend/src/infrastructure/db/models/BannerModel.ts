import { Schema, Document, model, Types } from "mongoose";
import { IBanner } from "../../../domain/entities/IBanner";

export interface IBannerDocument extends Omit<IBanner, "_id">, Document {
  _id: Types.ObjectId;   
}

const BannerSchema = new Schema<IBannerDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: "" },
    action: { type: String, required: true, enum: ["/discover", "/plans", "play-featured"] },
    createdBy: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const BannerModel = model<IBannerDocument>("Banner", BannerSchema);
export default BannerModel;
