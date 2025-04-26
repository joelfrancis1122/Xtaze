export interface Artist {
    id: string;
    name: string;
    role: string;
    image: string;
    isActive: boolean;
  }

// src/types/Artist.ts

export interface ArtistS {
  _id: string;
  username: string;
  country: string;
  gender: string;
  year: string;
  phone: string;
  email: string;
  role?: string;
  isActive?: boolean;
  premium?: boolean;
  profilePic: string;
  bio: string;
  banner: string;
}
