export interface UserDTO {
  id: string;
  username: string;
  country: string;
  gender: string;
  year: number;
  phone: number;
  email: string;
  role: "user" | "artist" | "provider" | "admin";
  isActive: boolean;
  profilePic?: string | null;
  bio?: string | null;
  banner?: string | null;
  premium?: string;
  likedSongs?: string[];
  paymentStatus?: boolean;
  stripePaymentMethodId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
