import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, },
    country: { type: String, required: true },
    gender: { type: String, required: true },
    year: { type: Number, required: true },
    phone: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    premium: { type: String, default: "Free" },
    role: {
      type: String,
      enum: ["user", "artist", "provider", "admin"],
      required: true,
      default: "user",
      
    },
    isActive: { type: Boolean, default: true },
    profilePic: { type: String, default: null },
    bio: { type: String, default: null },
    banner:{type:String,default:null},
    likedSongs:{type:[String],default:[]},
    stripePaymentMethodId:{type:String},
    paymentStatus:{type:Boolean,default:false}
  },
  
  { timestamps: true }
);

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
