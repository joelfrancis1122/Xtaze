import { useState, useEffect } from "react";
import { ChevronLeft, DollarSign, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./adminComponents/aside-side";
import { toast } from "sonner";
import { fetchMonetizationData, initiateArtistPayout } from "../../services/adminService";

interface MusicMonetization {
  trackId: string;
  trackName: string;
  artistName: string;
  totalPlays: number;
  monthlyPlays: number;
  totalRevenue: number;
  monthlyRevenue: number;
  lastUpdated: string;
  paymentStatus: boolean;
}

interface ArtistData {
  artistName: string;
  totalPlays: number;
  monthlyPlays: number;
  totalRevenue: number;
  monthlyRevenue: number;
  songs: MusicMonetization[];
  paymentStatus: boolean;
}

export default function AdminMusicMonetizationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [artists, setArtists] = useState<ArtistData[]>([]);
  const [expandedArtist, setExpandedArtist] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMonetizationDataAsync = async () => {
      try {
        setLoading(true);
        const rawData = await fetchMonetizationData();

        const groupedData = rawData.reduce((acc: { [key: string]: ArtistData }, song: MusicMonetization) => {
          if (!acc[song.artistName]) {
            acc[song.artistName] = {
              artistName: song.artistName,
              totalPlays: 0,
              monthlyPlays: 0,
              totalRevenue: 0,
              monthlyRevenue: 0,
              songs: [],
              paymentStatus: song.paymentStatus || false,
            };
          }
          acc[song.artistName].totalPlays += song.totalPlays;
          acc[song.artistName].monthlyPlays += song.monthlyPlays;
          acc[song.artistName].totalRevenue += song.totalRevenue;
          acc[song.artistName].monthlyRevenue += song.monthlyRevenue;
          acc[song.artistName].songs.push({ ...song, paymentStatus: song.paymentStatus || false });
          return acc;
        }, {});

        setArtists(Object.values(groupedData));
        setError(null);
      } catch (err: any) {
        toast.error(err.message || "Failed to load monetization data");
        setError("Failed to load monetization data");
      } finally {
        setLoading(false);
      }
    };

    fetchMonetizationDataAsync();

    // Handle success redirect
    const params = new URLSearchParams(location.search);
    const artistName = params.get("artistName");
    if (artistName && location.pathname === "/admin/payoutSuccess") {
      setArtists((prev) =>
        prev.map((artist) =>
          artist.artistName === artistName
            ? {
                ...artist,
                paymentStatus: true,
                songs: artist.songs.map((song) => ({ ...song, paymentStatus: true })),
              }
            : artist
        )
      );
      const monthlyRevenue = artists.find((a) => a.artistName === artistName)?.monthlyRevenue;
      toast.success(`$${monthlyRevenue?.toFixed(2)} paid for ${artistName} via Stripe Checkout`);
      // Redirect is handled in AdminPayoutSuccessPage, so no need here
    }
  }, [location]);

  const handlePayArtist = async (artistName: string) => {
    try {
      const sessionUrl = await initiateArtistPayout(artistName, );
      if (sessionUrl) {
        window.location.href = sessionUrl;
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to initiate payout";
      toast.error(`Payout failed for ${artistName}: ${errorMessage}`);
    }
  };

  const toggleArtist = (artistName: string) => {
    setExpandedArtist(expandedArtist === artistName ? null : artistName);
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
                <p className="text-gray-400">Total Plays (All Time)</p>
                <p className="text-2xl font-bold">
                  {artists.reduce((sum, artist) => sum + artist.totalPlays, 0).toLocaleString()}
                </p>
                <p className="text-gray-400 mt-2">This Month</p>
                <p className="text-xl font-bold">
                  {artists.reduce((sum, artist) => sum + artist.monthlyPlays, 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Total Revenue (All Time)</p>
                <p className="text-2xl font-bold">
                  ${artists.reduce((sum, artist) => sum + artist.totalRevenue, 0).toFixed(2)}
                </p>
                <p className="text-gray-400 mt-2">This Month</p>
                <p className="text-xl font-bold">
                  ${artists.reduce((sum, artist) => sum + artist.monthlyRevenue, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <p className="text-gray-400 text-center py-4">Loading monetization data...</p>
          ) : error ? (
            <p className="text-red-400 text-center py-4">{error}</p>
          ) : artists.length > 0 ? (
            <div className="bg-[#151515] rounded-xl shadow-lg border border-gray-900 overflow-hidden">
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 text-gray-400 text-lg font-semibold border-b border-gray-700">
                <span>Artist Name</span>
                <span>Total Plays</span>
                <span>Monthly Plays</span>
                <span>Monthly Revenue</span>
                <span className="text-right">Actions</span>
              </div>
              {artists.map((artist) => (
                <div key={artist.artistName}>
                  <div
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 hover:bg-[#212121] transition-all duration-200 items-center cursor-pointer"
                    onClick={() => toggleArtist(artist.artistName)}
                  >
                    <span className="text-white truncate">{artist.artistName}</span>
                    <span className="text-gray-400">{artist.totalPlays.toLocaleString()}</span>
                    <span className="text-gray-400">{artist.monthlyPlays.toLocaleString()}</span>
                    <span className="text-gray-400">${artist.monthlyRevenue.toFixed(2)}</span>
                    <div className="flex justify-end items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePayArtist(artist.artistName);
                        }}
                        disabled={artist.paymentStatus === true}
                        className={`flex items-center gap-1 px-3 py-1 rounded-md transition ${
                          artist.paymentStatus
                            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                            : "bg-green-700 hover:bg-green-600 text-white"
                        }`}
                      >
                        <DollarSign className="h-4 w-4" />
                        {artist.paymentStatus ? "Paid" : "Transfer"}
                      </button>
                      {expandedArtist === artist.artistName ? (
                        <ChevronUp className="h-5 w-5 text-gray-400 ml-2" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400 ml-2" />
                      )}
                    </div>
                  </div>
                  {expandedArtist === artist.artistName && (
                    <div className="bg-[#1a1a1a] px-6 py-1 border-t border-gray-700">
                      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 text-gray-400 text-sm font-semibold border-b border-gray-700 pb-2">
                        <span>Track Name</span>
                        <span>Total Plays</span>
                        <span>Monthly Plays</span>
                        <span>Total Revenue</span>
                        <span>Monthly Revenue</span>
                      </div>
                      {artist.songs.map((song) => (
                        <div
                          key={song.trackId}
                          className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 py-2 items-center hover:bg-[#252525] transition-all duration-200"
                        >
                          <span className="text-white truncate">{song.trackName}</span>
                          <span className="text-gray-400">{song.totalPlays.toLocaleString()}</span>
                          <span className="text-gray-400">{song.monthlyPlays.toLocaleString()}</span>
                          <span className="text-gray-400">${song.totalRevenue.toFixed(2)}</span>
                          <span className="text-gray-400">${song.monthlyRevenue.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
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