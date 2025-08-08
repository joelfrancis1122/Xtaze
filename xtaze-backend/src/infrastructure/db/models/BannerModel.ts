import { Schema, Document, model } from "mongoose";
import { IBanner } from "../../../domain/entities/IBanner";

export interface IBannerDocument extends IBanner, Document {}

const BannerSchema = new Schema<IBannerDocument>(
  {
   
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: false, 
      default: "",
    },
    action: {
      type: String,
      required: true,
      enum: ["/discover", "/plans", "play-featured"],
    },
    // position: {
    //   type: String,
    //   required: true,
    //   enum: ["top", "middle", "bottom"],
    //   default: "middle",
    // },
    createdBy: {
      type: String, 
      required: false, 
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true } 
);

const BannerModel = model<IBannerDocument>("Banner", BannerSchema);
export default BannerModel;