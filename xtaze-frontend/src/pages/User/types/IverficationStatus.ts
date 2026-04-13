export interface VerificationStatus {
    status: "pending" | "approved" | "rejected" | "unsubmitted";
    idProof?: string;
    feedback?: string | null;
  }