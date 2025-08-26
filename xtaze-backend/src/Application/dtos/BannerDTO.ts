export interface BannerDTO {
  id: string;             // <-- add this
  title: string;
  description: string;
  imageUrl: string;
  action: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
