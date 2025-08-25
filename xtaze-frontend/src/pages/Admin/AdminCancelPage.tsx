import { useNavigate, useLocation } from "react-router-dom";
import { XCircle } from "lucide-react";
import { toast } from "sonner";
import Sidebar from "./adminComponents/aside-side";

export default function AdminPayoutCancelPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const artistName = params.get("artistName") || "Unknown Artist";

  toast.error(`Payout for ${artistName} was canceled.`);

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <div className="flex-1 ml-64 py-7 px-6 pb-20 flex items-center justify-center">
        <div className="bg-[#151515] p-8 rounded-xl shadow-lg border border-gray-900 text-center max-w-md w-full">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Payout Canceled</h1>
          <p className="text-gray-400 mb-6">
            The payout for <span className="text-white">{artistName}</span> was canceled. No funds have been processed.
          </p>
          <button
            onClick={() => navigate("/admin/monetization", { replace: true })}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition"
          >
            Return to Music Monetization
          </button>
        </div>
      </div>
    </div>
  );
}