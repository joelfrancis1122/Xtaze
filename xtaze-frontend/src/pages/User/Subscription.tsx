"use client";

import { useEffect, useState } from "react";
import { PricingCard } from "./userComponents/pricing-card";
import Sidebar from "./userComponents/SideBar";
import { loadStripe } from "@stripe/stripe-js";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { fetchPricingPlans, initiateCheckout, verifyCoupon } from "../../services/userService";

const stripePromise = loadStripe("pk_test_51QuvsvQV9aXBcHmZPYCW1A2NRrd5mrEffAOVJMFOlrYDOl9fmb028A85ZE9WfxKMdNgTTA5MYoG4ZwCUQzHVydZj00eBUQVOo9");

interface PricingPlan {
  name: string;
  price: number;
  period: string;
  features: string[];
  priceId?: string;
  featured?: boolean;
}

interface Coupon {
  _id: string;
  code: string;
  discountAmount: number; // Percentage
  expires: string;
  maxUses: number;
  uses: number;
  status: "active" | "expired";
}

export default function PricingPage() {
  const user = useSelector((state: RootState) => state.user.signupData);
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [plans, setPlans] = useState<PricingPlan[]>([
    {
      name: "Free",
      price: 0,
      period: "month",
      features: ["30-second song previews", "Low-quality audio (128kbps)"],
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.premium !== "Free") {
      navigate("/home", { replace: true });
    }

    const fetchPlans = async () => {
      try {
        setLoading(true);
        const stripePlans = await fetchPricingPlans(); 
        setPlans([
          {
            name: "Free",
            price: 0,
            period: "month",
            features: ["30-second song previews", "Low-quality audio (128kbps)"],
          },
          ...stripePlans,
        ]);
      } catch (error: any) {
        console.error("Error fetching plans:", error);
        toast.error(error.message || "Failed to load premium plans", { position: "top-right" });
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [user, navigate]);

const validateCoupon = async () => {
  if (!couponCode.trim()) {
    setCouponError("Please enter a coupon code");
    setAppliedCoupon(null);
    return;
  }
  try {
    const token = localStorage.getItem("token") || "";
    const coupon = await verifyCoupon(couponCode, token);
    if (coupon.status === "active" && coupon.uses < coupon.maxUses && new Date(coupon.expires) >= new Date()) {
      setAppliedCoupon(coupon);
      setCouponError(null);
      toast.success("Coupon applied successfully!", { position: "top-right" });
    } else {
      throw new Error("Coupon is expired");
    }
  } catch (error: any) {
    setAppliedCoupon(null);
    setCouponError(error.message || "Invalid coupon code");
    toast.error(error.message || "Invalid coupon code", { position: "top-right" });
  }
};

  const getDiscountedPrice = (price: number) => {
    if (!appliedCoupon) return price;
    const discount = (appliedCoupon.discountAmount / 100) * price;
    return Math.max(0, price - discount); // Ensure price doesn’t go below 0
  };

  const handleGetPremium = async (priceId: string) => {
    const stripe = await stripePromise;
    if (!stripe || !user?._id) {
      toast.error("Stripe not loaded or user not logged in.", { position: "top-right" });
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const sessionId = await initiateCheckout(user._id, priceId, appliedCoupon?.code ?? "");
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        toast.error(error.message, { position: "top-right" });
      }
    } catch (error: any) {
      console.log(error,"krish")
      toast.error(error.response.data.message, { position: "top-right" });
    }
  };

  if (user?.premium !== "Free") {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
       <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
             {isSidebarOpen && (
               <div
                 className="fixed inset-0 bg-black/50 z-20 md:hidden"
                 onClick={() => setIsSidebarOpen(false)}
               ></div>
             )}
      <main className="flex-1 ml-64 py-20 px-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Simple pricing for everyone</h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Choose the plan that fits your needs. Upgrade, downgrade, or cancel anytime.
            </p>
          </div>

          {/* Coupon Input */}
          <div className="max-w-md mx-auto space-y-2">
            <label htmlFor="coupon" className="block text-sm font-medium text-gray-300">
              Have a coupon code?
            </label>
            <div className="flex gap-2">
              <input
                id="coupon"
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                onClick={validateCoupon}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
              >
                Apply
              </button>
            </div>
            {couponError && <p className="text-red-500 text-sm">{couponError}</p>}
            {appliedCoupon && (
              <p className="text-green-500 text-sm">
                {appliedCoupon.discountAmount}% off applied!
              </p>
            )}
          </div>

          {loading ? (
            <p className="text-gray-400 text-center">Loading plans...</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {plans.map((plan) => (
                <PricingCard
                  key={plan.name}
                  {...plan}
                  price={parseFloat(getDiscountedPrice(plan.price).toFixed(2))}

                  onGetPremium={plan.priceId ? () => handleGetPremium(plan.priceId as string) : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}