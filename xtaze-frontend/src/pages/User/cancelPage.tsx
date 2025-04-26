
import { useNavigate } from "react-router-dom";
import Sidebar from "./userComponents/SideBar";
import { useState } from "react";

export default function CancelPage() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
          <div className="bg-[#1d1d1d] p-6 rounded-xl shadow-lg w-full max-w-md mx-auto text-center space-y-6">
            <div className="text-red-500 text-5xl mb-4">✗</div>
            <h2 className="text-2xl font-bold text-white">Payment Cancelled</h2>
            <p className="text-gray-300">
              Your payment was cancelled. You can try again or continue with the free plan.
            </p>
            <button
              onClick={() => navigate("/plans", { replace: true })}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 ease-in-out transform hover:scale-105"
            >
              Back to Pricing
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}