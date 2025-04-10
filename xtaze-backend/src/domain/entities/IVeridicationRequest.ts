export interface IVerificationRequest {
    artistId: string;
    idProof: string; 
    status: "pending" | "approved" | "rejected" | "unsubmitted";
    submittedAt: Date;
    reviewedAt?: Date | null;
    feedback?: string | null;
  }
  