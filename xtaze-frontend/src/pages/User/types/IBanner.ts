export interface IBanner {
    _id:string
    title: string;
    description: string;
    imageUrl: string;
    action: string; 
    position: "top" | "middle" | "bottom";
    createdBy?: string; 
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string; 
  }

