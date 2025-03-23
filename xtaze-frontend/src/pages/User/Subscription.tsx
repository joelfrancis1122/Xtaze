"use client";

import { useEffect, useState } from "react";
import { PricingCard } from "./userComponents/pricing-card";
import Sidebar from "./userComponents/SideBar";
import { loadStripe } from "@stripe/stripe-js";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { initiateCheckout } from "../../services/userService";
import axios from "axios";

const stripePromise = loadStripe("pk_test_51QuvsvQV9aXBcHmZPYCW1A2NRrd5mrEffAOVJMFOlrYDOl9fmb028A85ZE9WfxKMdNgTTA5MYoG4ZwCUQzHVydZj00eBUQVOo9");

interface PricingPlan {
  name: string;
  price: number;
  period: string;
  features: string[];
  priceId?: string;
  featured?: boolean;
}

export default function PricingPage() {
  const user = useSelector((state: RootState) => state.user.signupData);
  const navigate = useNavigate();
  const [plans, setPlans] = useState<PricingPlan[]>([
    {
      name: "Free",
      price: 0,
      period: "month",
      features: ["30-second song previews", "Low-quality audio (128kbps)"],
    },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.premium !== "Free") {
      navigate("/home", { replace: true });
    }

    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:3000/admin/stripe/plans");
        const stripePlans: PricingPlan[] = response.data.data.map((plan: any) => ({
          name: plan.product.name,
          price: plan.price.unit_amount / 100,
          period: plan.price.recurring?.interval || "month",
          features: ["Full-length songs", "High-quality FLAC", "Offline playback", "Exclusive content"],
          priceId: plan.price.id,
          featured: true,
        }));
        setPlans([
          {
            name: "Free",
            price: 0,
            period: "month",
            features: ["30-second song previews", "Low-quality audio (128kbps)"],
          },
          ...stripePlans,
        ]);
        console.log(stripePlans,"ithan plans")
      } catch (error) {
        console.error("Error fetching plans:", error);
        toast.error("Failed to load premium plans", { position: "top-right" });
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [user, navigate]);

  const handleGetPremium = async (priceId: string) => {
    const stripe = await stripePromise;
    if (!stripe || !user?._id) {
      toast.error("Stripe not loaded or user not logged in.", { position: "top-right" });
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const sessionId = await initiateCheckout(user._id, priceId, token);
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        toast.error(error.message, { position: "top-right" });
      }
    } catch (error: any) {
      toast.error("Error initiating checkout: " + error.message, { position: "top-right" });
    }
  };

  if (user?.premium !=="Free") {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar />
      <main className="flex-1 ml-64 py-20 px-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Simple pricing for everyone</h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Choose the plan that fits your needs. Upgrade, downgrade, or cancel anytime.
            </p>
          </div>

          {loading ? (
            <p className="text-gray-400 text-center">Loading plans...</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {plans.map((plan) => (
                <PricingCard
                  key={plan.name}
                  {...plan}
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