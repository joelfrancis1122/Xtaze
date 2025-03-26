import { useState, useEffect } from "react";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ReactPaginate from "react-paginate";
import { Button } from "../../components/ui/button"; // Adjust path
import { Card } from "../../components/ui/card"; // Adjust path
import ArtistSidebar from "./artistComponents/artist-aside"; // Adjust path

interface SongImprovement {
  trackId: string;
  trackName: string;
  totalPlays: number;
  monthlyPlays: number;
  improvement: number;
  projectedEarnings: number;
}

export default function ArtistSongImprovementsPage() {
  const navigate = useNavigate();
  const [songs, setSongs] = useState<SongImprovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchSongImprovements = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:3000/artist/statsOfArtist", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setSongs(response.data.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load song improvements");
      } finally {
        setLoading(false);
      }
    };

    fetchSongImprovements();

    // Apply dashboard background styles
    const styles = `
      body, * {
        background-color: var(--background) !important; /* Dark background */
      }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet); // Cleanup on unmount
    };
  }, []);

  const pageCount = Math.ceil(songs.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentSongs = songs.slice(offset, offset + itemsPerPage);

  const handlePageChange = ({ selected }: { selected: number }) => {
    setCurrentPage(selected);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="grid lg:grid-cols-[280px_1fr]">
        {/* Sidebar Component */}
        <ArtistSidebar />

        <main className="flex-1 pl-0.4 pr-6 pt-5 pb-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="space-y-1">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition mb-2"
                title="Go back"
              >
                <ChevronLeft className="h-5 w-5 text-gray-400" />
              </button>
              <h1 className="text-2xl font-bold">Song Improvements</h1>
              <div className="text-sm text-muted-foreground">This month’s performance overview</div>
            </div>
            <Button variant="outline" className="gap-2">
              This Month
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Summary Card */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">This Month’s Overview</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-gray-400">Total Monthly Plays</p>
                <p className="text-2xl font-bold">
                  {songs.reduce((sum, song) => sum + song.monthlyPlays, 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Projected Earnings</p>
                <p className="text-2xl font-bold">
                  ${songs.reduce((sum, song) => sum + song.projectedEarnings, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </Card>

          {/* Songs Table */}
          {loading ? (
            <p className="text-gray-400 text-center py-4">Loading song data...</p>
          ) : error ? (
            <p className="text-red-400 text-center py-4">{error}</p>
          ) : songs.length > 0 ? (
            <Card className="mt-6 p-6">
              <h2 className="text-lg font-semibold mb-4">Your Songs</h2>
              <div className="overflow-hidden">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 text-gray-400 text-lg font-semibold border-b border-gray-700">
                  <span>Track Name</span>
                  <span>Total Plays</span>
                  <span>Monthly Plays</span>
                  <span>Improvement</span>
                  <span>Projected Earnings</span>
                </div>
                {currentSongs.map((song) => (
                  <div
                    key={song.trackId}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 hover:bg-[#212121] transition-all duration-200 items-center"
                  >
                    <span className="text-white truncate">{song.trackName}</span>
                    <span className="text-gray-400">{song.totalPlays.toLocaleString()}</span>
                    <span className="text-gray-400">{song.monthlyPlays.toLocaleString()}</span>
                    <span className={song.improvement >= 0 ? "text-green-400" : "text-red-400"}>
                      {song.improvement >= 0 ? "+" : ""}{song.improvement.toFixed(1)}%
                    </span>
                    <span className="text-gray-400">${song.projectedEarnings.toFixed(2)}</span>
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
            </Card>
          ) : (
            <Card className="mt-6 p-8 text-center">
              <p className="text-gray-400 text-lg">No song data available.</p>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}