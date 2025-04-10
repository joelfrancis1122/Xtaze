import mongoose, { Schema ,Document,model} from "mongoose"
import { IVerificationRequest } from "../../../domain/entities/IVeridicationRequest";
export interface IVerificationRequestDocument extends IVerificationRequest, Document{}

export const VerificationRequestSchema = new Schema<IVerificationRequestDocument>(
 {   artistId: { type: String, required: true, },
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

const VerificationModel = mongoose.model("Verification", VerificationRequestSchema);
export default VerificationModel;
