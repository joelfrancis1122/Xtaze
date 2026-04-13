import { Types } from "mongoose";

export interface IVerificationRequest {
  _id?: string | Types.ObjectId;   // 👈 allow both
  artistId: string;
  idProof: string;
  status: "pending" | "approved" | "rejected" | "unsubmitted";
  submittedAt: Date;
  reviewedAt?: Date | null;
  feedback?: string | null;

  // not stored in DB but returned in responses
  username?: string | null;
}
