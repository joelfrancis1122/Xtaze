export interface IBanner {
    title: string;
    description: string;
    imageUrl: string;
    action: string; 
    // position: "top" | "middle" | "bottom";
    createdBy?: string; 
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string; 
  }