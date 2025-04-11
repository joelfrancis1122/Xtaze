import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./adminComponents/aside-side";
import ReactPaginate from "react-paginate";
import { fetchSubscriptionHistory } from "../../services/adminService";

interface SubscriptionHistory {
  userId: string;
  email: string;
  planName: string;
  price: number;
  purchaseDate: string;
}

export default function AdminSubscriptionHistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<SubscriptionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionPage, setSubscriptionPage] = useState(0);
  const [payoutPage, setPayoutPage] = useState(0);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("adminToken") || "";

        const response = await fetchSubscriptionHistory(token);
        console.log(response, "asssssssss")
        setHistory(response);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load subscription history");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  // Filter histories
  const subscriptionHistory = history.filter(
    (entry) => entry.planName && entry.planName !== "Unknown Plan"
  );
  const artistPayoutHistory = history.filter(
    (entry) => entry.planName === "Unknown Plan"
  );

  // Pagination for Subscription History
  const subscriptionPageCount = Math.ceil(subscriptionHistory.length / itemsPerPage);
  const subscriptionOffset = subscriptionPage * itemsPerPage;
  const currentSubscriptionHistory = subscriptionHistory.slice(
    subscriptionOffset,
    subscriptionOffset + itemsPerPage
  );

  // Pagination for Artist Payout History
  const payoutPageCount = Math.ceil(artistPayoutHistory.length / itemsPerPage);
  const payoutOffset = payoutPage * itemsPerPage;
  const currentArtistPayoutHistory = artistPayoutHistory.slice(
    payoutOffset,
    payoutOffset + itemsPerPage
  );

  const handleSubscriptionPageChange = ({ selected }: { selected: number }) => {
    setSubscriptionPage(selected);
  };

  const handlePayoutPageChange = ({ selected }: { selected: number }) => {
    setPayoutPage(selected);
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <div className="flex-1 ml-64 py-7 px-6 pb-20">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition mb-4"
          title="Go back"
        >
          <ChevronLeft className="h-5 w-5 text-gray-400" />
        </button>

        <div className="max-w-7xl mx-auto space-y-10">
          {/* Subscription History Section */}
          <div>
            <h1 className="text-3xl font-bold mb-4">Subscription History</h1>
            {loading ? (
              <p className="text-gray-400 text-center py-4">Loading subscription history...</p>
            ) : error ? (
              <p className="text-red-400 text-center py-4">{error}</p>
            ) : subscriptionHistory.length > 0 ? (
              <>
                <div className="bg-[#151515] rounded-xl shadow-lg border border-gray-900 overflow-hidden">
                  <div className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-4 px-6 py-4 text-gray-400 text-lg font-semibold border-b border-gray-700">
                    <span>User Email</span>
                    <span>Plan Name</span>
                    <span>Price</span>
                    <span>Purchase Date</span>
                  </div>
                  {currentSubscriptionHistory.map((entry) => (
                    <div
                      key={entry.userId + entry.purchaseDate}
                      className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-4 px-6 py-4 hover:bg-[#212121] transition-all duration-200 items-center"
                    >
                      <span className="text-white truncate">{entry.email}</span>
                      <span className="text-gray-400">{entry.planName}</span>
                      <span className="text-gray-400">${entry.price.toFixed(2)}</span>
                      <span className="text-gray-400">{new Date(entry.purchaseDate).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-center">
                  <ReactPaginate
                    previousLabel={"Previous"}
                    nextLabel={"Next"}
                    breakLabel={"..."}
                    pageCount={subscriptionPageCount}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={5}
                    onPageChange={handleSubscriptionPageChange}
                    containerClassName={"flex gap-2"}
                    pageClassName={"rounded-md overflow-hidden"} // wrap for layout only
                    pageLinkClassName={"block px-3 py-1 bg-gray-700 text-white hover:bg-gray-600"} // clickable area
                    activeLinkClassName={"bg-gray-600"} // override when active
                    previousClassName={"rounded-md overflow-hidden"}
                    previousLinkClassName={"block px-3 py-1 bg-gray-700 text-white hover:bg-gray-600"}
                    nextClassName={"rounded-md overflow-hidden"}
                    nextLinkClassName={"block px-3 py-1 bg-gray-700 text-white hover:bg-gray-600"}
                    breakClassName={"text-gray-400"}
                    breakLinkClassName={"px-3 py-1 block"}
                    disabledClassName={"opacity-50 cursor-not-allowed"}
                  />

                </div>
              </>
            ) : (
              <div className="bg-[#1d1d1d] p-8 rounded-xl shadow-md border border-gray-800 text-center">
                <p className="text-gray-400 text-lg">No subscription history available.</p>
              </div>
            )}
          </div>

          {/* Artist Payout History Section */}
          <div>
            <h1 className="text-3xl font-bold mb-4">Artist Payout History</h1>
            {loading ? (
              <p className="text-gray-400 text-center py-4">Loading artist payout history...</p>
            ) : error ? (
              <p className="text-red-400 text-center py-4">{error}</p>
            ) : artistPayoutHistory.length > 0 ? (
              <>
                <div className="bg-[#151515] rounded-xl shadow-lg border border-gray-900 overflow-hidden">
                  <div className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-4 px-6 py-4 text-gray-400 text-lg font-semibold border-b border-gray-700">
                    <span>Artist Email</span>
                    <span>Type</span>
                    <span>Amount</span>
                    <span>Payout Date</span>
                  </div>
                  {currentArtistPayoutHistory.map((entry) => (
                    <div
                      key={entry.userId + entry.purchaseDate}
                      className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-4 px-6 py-4 hover:bg-[#212121] transition-all duration-200 items-center"
                    >
                      <span className="text-white truncate">{entry.email}</span>
                      <span className="text-gray-400">Payout</span>
                      <span className="text-gray-400">${entry.price.toFixed(2)}</span>
                      <span className="text-gray-400">{new Date(entry.purchaseDate).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-center">
                  <ReactPaginate
                    previousLabel={"Previous"}
                    nextLabel={"Next"}
                    breakLabel={"..."}
                    pageCount={payoutPageCount}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={5}
                    onPageChange={handlePayoutPageChange}
                    containerClassName={"flex gap-2"}
                    pageClassName={"bg-gray-700 text-white px-3 py-1 rounded-md hover:bg-gray-600"}
                    activeClassName={"bg-gray-600"}
                    previousClassName={"bg-gray-700 text-white px-3 py-1 rounded-md hover:bg-gray-600"}
                    nextClassName={"bg-gray-700 text-white px-3 py-1 rounded-md hover:bg-gray-600"}
                    breakClassName={"text-gray-400 px-3 py-1"}
                    disabledClassName={"opacity-50 cursor-not-allowed"}
                  />
                </div>
              </>
            ) : (
              <div className="bg-[#1d1d1d] p-8 rounded-xl shadow-md border border-gray-800 text-center">
                <p className="text-gray-400 text-lg">No artist payout history available.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}