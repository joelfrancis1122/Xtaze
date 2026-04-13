export interface PlaylistDTO {
  id: string;             // string version of _id
  title: string;
  description: string;
  imageUrl?: string;
  trackCount?: number;
  createdBy: string;
  tracks: string[];
  createdAt?: string;
  updatedAt?: string;
}