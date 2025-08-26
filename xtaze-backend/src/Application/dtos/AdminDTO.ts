export interface AdminDTO {
  id: string;
  username: string;
  email: string;
  role: "admin";
  isActive: boolean;
  profilePic?: string | null;
  bio?: string | null;
  banner?: string | null;
  createdAt: string;
  updatedAt: string;
}