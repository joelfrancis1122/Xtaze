export interface IPlan {
    name: string;
    description: string;
    price: number;
    interval: "monthly" | "yearly" 
    createdAt?: Date;
    updatedAt?: Date;
  }
  