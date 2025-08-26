export interface VerificationDTO {
  id: string;
  userId: string;
  username?: string | null;
  documentUrl: string;
  status: "pending" | "approved" | "rejected" | "unsubmitted";
  createdAt: string;
  updatedAt: string;
}
