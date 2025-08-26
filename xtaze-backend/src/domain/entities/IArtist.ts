export interface IArtist {
  _id?: string;
  username: string;
  email: string;
  role: "artist";
  isActive?: boolean;
  profilePic?: string | null;
  bio?: string | null;
  banner?: string | null;
  premium?: string;
  paymentStatus?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
