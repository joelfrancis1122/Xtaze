import mongoose, { Schema, Document, Model } from "mongoose";
import { IVerificationRequest } from "../../../domain/entities/IVerificationRequest";

export interface IVerificationRequestDocument 
  extends Omit<IVerificationRequest, "_id">, Document {}

const VerificationRequestSchema = new Schema<IVerificationRequestDocument>({
  artistId: { type: String, required: true },
  idProof: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "unsubmitted"],
    default: "pending",
  },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date, default: null },
  feedback: { type: String, default: null },
});

// Now model type will return correct inference
const VerificationModel: Model<IVerificationRequestDocument> = 
  mongoose.model("Verification", VerificationRequestSchema);

export default VerificationModel;
