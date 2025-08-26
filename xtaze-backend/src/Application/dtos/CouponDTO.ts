export interface CouponDTO {
  code: string;
  discountAmount: number;
  expires: string;
  maxUses: number;
  uses: number;
  status: string;
}
