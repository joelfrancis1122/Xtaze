export interface IAdmin {
  _id?: string;
  username: string;
  email: string;
  role: "admin";
  isActive?: boolean;
  profilePic?: string | null;
  bio?: string | null;
  banner?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}