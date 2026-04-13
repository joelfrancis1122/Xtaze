
export default interface IUser {
  toObject?: () => IUser;
  _id?: string;
  username: string;
  country: string;
  gender: string;
  year: number;
  phone: number;
  email: string;
  password: string;
  premium?: string;
  role?: "user" | "artist" | "provider" | "admin";
  isActive?: boolean;
  profilePic?: string;
  isGoogleUser?: boolean;

  bio?: string;
  banner?: string;
  likedSongs?: string[];
  stripePaymentMethodId?: string | null;
  paymentStatus?: boolean
}

