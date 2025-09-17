import { ICoupon } from "../../domain/entities/ICoupon";
import { CouponDTO } from "../dtos/CouponDTO";

export class CouponMapper {
  static toDTO(coupon: ICoupon): CouponDTO {
    return {
      id: coupon.id!,
      code: coupon.code,
      discountAmount: coupon.discountAmount,
      expires: coupon.expires,
      maxUses: coupon.maxUses,
      uses: coupon.uses ?? 0,
      status: coupon.status ?? "active"
    };
  }

  static toDTOs(coupons: ICoupon[]): CouponDTO[] {
    return coupons.map(this.toDTO);
  }
}
