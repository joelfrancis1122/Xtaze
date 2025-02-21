"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Sidebar from "./userComponents/SideBar";
import { clearSignupData } from "../../redux/userSlice";
import { clearAudioState } from "../../redux/audioSlice";
import { Power } from "lucide-react";
import { audio } from "../../utils/audio"; // Global audio instance

export default function SubscriptionPlans() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<"free" | "premium" | null>(null);

  const handleLogout = () => {
    audio.pause();
    audio.src = "";
    localStorage.removeItem("token");
    dispatch(clearSignupData());
    dispatch(clearAudioState());
    navigate("/", { replace: true });
  };

  const handleSubscribe = (plan: "free" | "premium") => {
    setSelectedPlan(plan);
    // Add subscription logic here (e.g., API call to update user plan)
    console.log(`Subscribed to ${plan} plan`);
  };

  return (
    <div className="flex h-screen flex-col bg-black text-white">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 min-h-screen ml-64 bg-black overflow-y-auto">
          <header className="flex justify-between items-center p-4 sticky top-0 bg-black z-10">
            <h1 className="text-2xl font-bold">Subscription Plans</h1>
            <button className="p-2 hover:bg-[#242424] rounded-full" onClick={handleLogout}>
              <Power size={20} />
            </button>
          </header>

          <section className="px-6 py-4">
            <div className="flex flex-col items-center gap-8">
              <h2 className="text-3xl font-bold text-center">Choose Your Plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
                {/* Free Plan */}
                <div
                  className={`bg-[#1d1d1d] p-6 rounded-lg shadow-md flex flex-col items-center transition-colors ${
                    selectedPlan === "free" ? "border-2 border-green-500" : "hover:bg-[#242424]"
                  }`}
                >
                  <h3 className="text-2xl font-bold mb-4">Free</h3>
                  <p className="text-gray-400 text-center mb-4">
                    Get a taste of our music library with limited features.
                  </p>
                  <ul className="text-gray-300 text-sm space-y-2 mb-6">
                    <li>30-second song previews</li>
                    <li>Low-quality audio (128kbps)</li>
                    <li>Ads included</li>
                    <li>Limited skips</li>
                  </ul>
                  <p className="text-xl font-semibold mb-6">$0 / month</p>
                 
                </div>

                {/* Premium Plan */}
                <div
                  className={`bg-[#1d1d1d] p-6 rounded-lg shadow-md flex flex-col items-center transition-colors ${
                    selectedPlan === "premium" ? "border-2 border-blue-500" : "hover:bg-[#242424]"
                  }`}
                >
                  <h3 className="text-2xl font-bold mb-4">Premium</h3>
                  <p className="text-gray-400 text-center mb-4">
                    Unlock the full experience with high-quality audio and exclusive features.
                  </p>
                  <ul className="text-gray-300 text-sm space-y-2 mb-6">
                    <li>Full-length songs</li>
                    <li>High-quality FLAC (up to 24-bit/192kHz)</li>
                    <li>Ad-free listening</li>
                    <li>Unlimited skips</li>
                    <li>Offline playback</li>
                    <li>Exclusive content</li>
                  </ul>
                  <p className="text-xl font-semibold mb-6">$9.99 / month</p>
                  <button
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    onClick={() => handleSubscribe("premium")}
                  >
                    Select Premium Plan
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}