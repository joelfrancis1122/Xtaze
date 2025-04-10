export interface IVerificationStatusResponse {
    status: "unsubmitted" | "pending" | "approved" | "rejected";
    idProof?: string;
    feedback?: string | null;
  }
  