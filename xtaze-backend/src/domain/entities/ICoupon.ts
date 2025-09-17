export interface ICoupon {
  id?: string;
  code: string;
  discountAmount: number;
  expires: string;
  maxUses: number;
  uses?: number;
  status?: string;
  users?: string[]
}