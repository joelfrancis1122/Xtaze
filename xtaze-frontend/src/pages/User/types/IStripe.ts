export interface StripePrice {
  id: string;
  product: string;
  unit_amount: number;
  currency: string;
  recurring?: { interval: "month" | "year" };
  active: boolean;
}

export interface StripeProduct {
    id: string;
    name: string;
    description?: string;
    active: boolean;
  }
  
  export interface SubscriptionPlan {
    product: StripeProduct;
    price: StripePrice;
  }
  