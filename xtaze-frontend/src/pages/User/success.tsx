"use client";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./userComponents/SideBar";

export default function SuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/home", { replace: true });
    }, 3000); 

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar />
      <main className="flex-1 ml-64 py-20 px-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="bg-[#1d1d1d] p-6 rounded-xl shadow-lg w-full max-w-md mx-auto text-center space-y-6">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-white">Premium Subscription Activated!</h2>
            <p className="text-gray-300">
              Congratulations! You now have access to all premium features. Enjoy the full experience!
            </p>
            <button
              onClick={() => navigate("/home", { replace: true })}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 ease-in-out transform hover:scale-105"
            >
              Go to Home
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}