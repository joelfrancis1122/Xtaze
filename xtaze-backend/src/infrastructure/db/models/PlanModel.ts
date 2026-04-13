import mongoose, { Schema, Document } from "mongoose";
import { IPlan } from "../../../domain/entities/IPlan";

interface IPlanModel extends IPlan, Document {}

const PlanSchema = new Schema<IPlanModel>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    interval: { type: String, enum: ["monthly", "yearly", "weekly"], required: true },
  },
  { timestamps: true } 
);

export const PlanModel = mongoose.model<IPlanModel>("Plan", PlanSchema);
