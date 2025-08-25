import { useEffect, useState } from "react";
import { listActiveArtists, fetchArtistTracks } from "../../../services/adminService";

interface Artist {
  id: string;
  name: string;
  role: string;
  image: string;
  isActive: boolean;
}

interface PlayHistory {
  month: string;
  plays: number;
}

interface Track {
  _id: string;
  title: string;
  listeners: string[];
  playHistory: PlayHistory[];
}

interface ArtistWithListeners extends Artist {
  monthlyListeners: number;
}
export function PopularArtists() {
  const [allArtists, setAllArtists] = useState<ArtistWithListeners[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 5;

  useEffect(() => {
    const fetchTopArtists = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("adminToken");
        if (!token) throw new Error("No token found. Please login.");

        // ✅ fetch all artists instead of just page 5
        const { data: artistList } = await listActiveArtists(1, 9999); 

        const filtered = artistList.filter((artist) => artist.role === "artist");

        function getRecentMonths(count: number): string[] {
          const now = new Date();
          return Array.from({ length: count }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          });
        }
        const relevantMonths = getRecentMonths(2);

        const artistsWithListeners: ArtistWithListeners[] = await Promise.all(
          filtered.map(async (artist) => {
            try {
              const tracks = await fetchArtistTracks(artist.id);
              const listenersSet = new Set<string>();

              tracks.forEach((track) => {
                const hasRecentPlays = track.playHistory.some((entry) =>
                  relevantMonths.includes(entry.month)
                );
                if (hasRecentPlays) {
                  track.listeners.forEach((listener) => listenersSet.add(listener));
                }
              });

              return { ...artist, monthlyListeners: listenersSet.size };
            } catch {
              return { ...artist, monthlyListeners: 0 };
            }
          })
        );

        // ✅ sort globally once
        const sorted = artistsWithListeners.sort(
          (a, b) => b.monthlyListeners - a.monthlyListeners
        );

        setAllArtists(sorted);
        setLoading(false);
      } catch (err) {
        setError("Failed to load top artists. Please try again.");
        setLoading(false);
      }
    };

    fetchTopArtists();
  }, []);

  const totalPages = Math.ceil(allArtists.length / limit);
  const paginatedArtists = allArtists.slice((page - 1) * limit, page * limit);

  if (loading) return <div className="text-center text-white">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <table className="w-full border-separate border-spacing-y-1">
        <thead className="bg-gray-900 text-white">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-semibold border-b">Artist</th>
            <th className="px-4 py-2 text-center text-sm font-semibold border-b">Monthly Listeners</th>
          </tr>
        </thead>
        <tbody>
          {paginatedArtists.map((artist, index) => (
            <tr key={index} className="border-b">
              <td className="px-4 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <img
                    src={artist.image}
                    alt={artist.name || "Default Avatar"}
                    className="h-8 w-8 rounded-full object-cover transition-transform duration-200 hover:scale-150"
                  />
                  {artist.name}
                </div>
              </td>
              <td className="px-4 py-2 text-center text-sm">
                {artist.monthlyListeners.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 bg-gray-800 text-white rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-white">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 bg-gray-800 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
