export interface IBanner {
  _id:string
  title: string;
  description: string;
  imageUrl: string;
  action: string;
  createdBy?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}