import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";
import Sidebar from "./adminComponents/aside-side";

export default function AdminPayoutSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(5);

  // Extract artistName from URL parameters
  const params = new URLSearchParams(location.search);
  const artistName = params.get("artistName") || "Unknown Artist";

  useEffect(() => {
    // Notify user of success
    toast.success(`Payout for ${artistName} completed successfully!`);

    // Countdown to redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/admin/monetization", { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, artistName]);

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar/>
      <div className="flex-1 ml-64 py-7 px-6 pb-20 flex items-center justify-center">
        <div className="bg-[#151515] p-8 rounded-xl shadow-lg border border-gray-900 text-center max-w-md w-full">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Payout Successful</h1>
          <p className="text-gray-400 mb-6">
            The payout for <span className="text-white">{artistName}</span> has been successfully processed via Stripe Checkout.
          </p>
          <p className="text-gray-400">
            Redirecting to Music Monetization in {countdown} seconds...
          </p>
          <button
            onClick={() => navigate("/admin/monetization", { replace: true })}
            className="mt-6 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition"
          >
            Return Now
          </button>
        </div>
      </div>
    </div>
  );
}