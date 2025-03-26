import { useState, useEffect } from "react";
import { ChevronLeft, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./adminComponents/aside-side";
import ReactPaginate from "react-paginate";
import { toast } from "sonner";

interface MusicMonetization {
  trackId: string;
  trackName: string;
  artistName: string;
  totalPlays: number;
  revenue: number;
  lastUpdated: string;
  paid: boolean;
}

export default function AdminMusicMonetizationPage() {
  const navigate = useNavigate();
  const [monetizationData, setMonetizationData] = useState<MusicMonetization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchMonetizationData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:3000/admin/music/monetization", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setMonetizationData(response.data.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load monetization data");
      } finally {
        setLoading(false);
      }
    };

    fetchMonetizationData();
  }, []);

  const handlePayArtist = async (trackId: string) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/admin/music/payout",
        { trackId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (response.data.success) {
        setMonetizationData((prev) =>
          prev.map((item) =>
            item.trackId === trackId ? { ...item, paid: true } : item
          )
        );
        toast.success(`Transferred to wallet for ${monetizationData.find((d) => d.trackId === trackId)?.trackName}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to transfer to wallet");
    }
  };

  const pageCount = Math.ceil(monetizationData.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentData = monetizationData.slice(offset, offset + itemsPerPage);

  const handlePageChange = ({ selected }: { selected: number }) => {
    setCurrentPage(selected);
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
          <h1 className="text-3xl font-bold">Music Monetization (Based on Plays)</h1>

          <div className="bg-[#151515] p-6 rounded-xl shadow-lg border border-gray-900">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400">Total Plays</p>
                <p className="text-2xl font-bold">
                  {monetizationData.reduce((sum, item) => sum + item.totalPlays, 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold">
                  ${monetizationData.reduce((sum, item) => sum + item.revenue, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <p className="text-gray-400 text-center py-4">Loading monetization data...</p>
          ) : error ? (
            <p className="text-red-400 text-center py-4">{error}</p>
          ) : monetizationData.length > 0 ? (
            <>
              <div className="bg-[#151515] rounded-xl shadow-lg border border-gray-900 overflow-hidden">
                <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 text-gray-400 text-lg font-semibold border-b border-gray-700">
                  <span>Track Name</span>
                  <span>Artist Name</span>
                  <span>Total Plays</span>
                  <span>Revenue</span>
                  <span>Last Updated</span>
                  <span className="text-right">Actions</span>
                </div>
                {currentData.map((entry) => (
                  <div
                    key={entry.trackId}
                    className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 hover:bg-[#212121] transition-all duration-200 items-center"
                  >
                    <span className="text-white truncate">{entry.trackName}</span>
                    <span className="text-gray-400">{entry.artistName}</span>
                    <span className="text-gray-400">{entry.totalPlays.toLocaleString()}</span>
                    <span className="text-gray-400">${entry.revenue.toFixed(2)}</span>
                    <span className="text-gray-400">
                      {new Date(entry.lastUpdated).toLocaleDateString()}
                    </span>
                    <div className="flex justify-end">
                      <button
                        onClick={() => handlePayArtist(entry.trackId)}
                        disabled={entry.paid}
                        className={`flex items-center gap-1 px-3 py-1 rounded-md transition ${
                          entry.paid
                            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                            : "bg-green-700 hover:bg-green-600 text-white"
                        }`}
                      >
                        <DollarSign className="h-4 w-4" />
                        {entry.paid ? "Paid" : "Transfer"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-center">
                <ReactPaginate
                  previousLabel={"Previous"}
                  nextLabel={"Next"}
                  breakLabel={"..."}
                  pageCount={pageCount}
                  marginPagesDisplayed={2}
                  pageRangeDisplayed={5}
                  onPageChange={handlePageChange}
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
              <p className="text-gray-400 text-lg">No monetization data available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}