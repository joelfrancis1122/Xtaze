"use client";

import { useState, useEffect } from "react";
import { PricingCard } from "./userComponents/pricing-card";
import Sidebar from "./userComponents/SideBar";
import { loadStripe } from "@stripe/stripe-js";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";
import { toast } from "sonner";


const stripePromise = loadStripe("pk_test_51QuvsvQV9aXBcHmZPYCW1A2NRrd5mrEffAOVJMFOlrYDOl9fmb028A85ZE9WfxKMdNgTTA5MYoG4ZwCUQzHVydZj00eBUQVOo9");

const plans = [
  {
    name: "Free",
    price: 0,
    period: "month",
    features: ["30-second song previews", "Low-quality audio (128kbps)"],
  },
  {
    name: "Premium",
    price: 29,
    period: "month",
    featured: true,
    features: [
      "Full-length songs",
      "High-quality FLAC (up to 24-bit/192kHz)",
      "Offline playback",
      "Exclusive content",
    ],
  },
];

export default function PricingPage() {
  const user = useSelector((state: RootState) => state.user.signupData);
  const navigate = useNavigate(); // Hook for redirection
  const baseUrl = import.meta.env.VITE_BASE_URL;
  // Check premium status and redirect if true
  useEffect(() => {
    if (user?.premium === true) {
      navigate("/home", { replace: true }); 
    }
  }, [user, navigate]);

  const handleGetPremium = async () => {
    const stripe = await stripePromise;
    if (!stripe || !user?._id) {
      toast.error("Stripe not loaded or user not logged in.", { position: "top-right" });
      return;
    }

    try {
      const response = await axios.post(
        `${baseUrl}/user/checkOut`,
        {
          userId: user._id,
          priceId: "price_1QwLeQQV9aXBcHmZhnzqbz5G",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      const { sessionId } = response.data;

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        toast.error(error.message, { position: "top-right" });
      }
    } catch (error: any) {
      toast.error("Error initiating checkout: " + error.message, { position: "top-right" });
    }
  };

  // Only render if premium is false or undefined (not logged in yet)
  if (user?.premium === true) {
    return null; // Return null while redirecting
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

          <div className="grid md:grid-cols-2 gap-8">
            {plans.map((plan) => (
              <PricingCard
                key={plan.name}
                {...plan}
                onGetPremium={plan.name === "Premium" ? handleGetPremium : undefined}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}