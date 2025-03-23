export interface UserSignupData {
    _id?: string;
    username: string;
    country: string;
    gender: string;
    year: string;
    phone: string;
    email: string;
    role?: string;
    isActive?: boolean;
    premium?: string;
    profilePic?: string;
    likedSongs?: string[];
  }