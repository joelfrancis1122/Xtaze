import mongoose, { Schema, Document } from "mongoose";
import { ICoupon } from "../../../domain/entities/ICoupon";
interface CouponModel extends ICoupon, Document {}

const CouponSchema = new Schema<CouponModel>(
  {
    
    code: { type: String, required: true, unique: true },

    discountAmount: { type: Number, required: true },
    expires: { type: String, required: true }, 
    maxUses: { type: Number, required: true },
    uses: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "expired"],
      default: "active",
    },
    users:{ type: [String], default: [] },
  },
  { timestamps: true }  
);

CouponSchema.pre("save", function (next) {
  this.status = new Date(this.expires) > new Date() ? "active" : "expired";
  next();
});

export const CouponModel = mongoose.model<CouponModel>("Coupon", CouponSchema);