
import { useEffect, useState } from "react";
import { fetchAllTrack } from "../../../services/userService";

interface Track {
  title: string;
  artists: string;
  listeners: string[]; // Array of listeners
}

// Helper function to format large numbers (e.g., 1200000 -> "1.2M")
const formatListenersCount = (count: number): string => {
  return count >= 1_000_000
    ? `${(count / 1_000_000).toFixed(1)}M`
    : count >= 1_000
    ? `${(count / 1_000).toFixed(1)}K`
    : count.toString();
};

export function PopularTracks() {
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const tracks = await fetchAllTrack();
        console.log("Fetched Tracks:", tracks);

        // Sort tracks based on the number of listeners
        const sortedTracks = tracks
          .map((track) => ({
            ...track,
            totalListeners: track.listeners.length, // Get listener count
          }))
          .sort((a, b) => b.totalListeners - a.totalListeners) // Sort by listeners
          .slice(0, 5); // Get top 5

        setTopTracks(sortedTracks);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching tracks:", err);
        setError("Failed to load popular tracks. Please try again.");
        setLoading(false);
      }
    };

    fetchTracks();
  }, []);

  if (loading) {
    return <div className="text-center text-white">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <table className="w-full border-separate border-spacing-y-1">
      {/* Table Header */}
      <thead className="bg-gray-900 text-white">
        <tr>
          <th className="px-4 py-3 text-left text-sm font-bold border-b border-gray-400">
            Title
          </th>
          <th className="px-4 py-3 text-left text-sm font-bold border-b border-gray-400">
            Artist
          </th>
          <th className="px-4 py-3 text-center text-sm font-bold border-b border-gray-400">
            Listeners
          </th>
        </tr>
      </thead>

      {/* Table Body */}
      <tbody>
        {topTracks.map((track, index) => (
          <tr key={index} className="border-b border-gray-300">
            <td className="px-4 py-3 text-sm font-medium">{track.title}</td>
            <td className="px-4 py-3 text-sm font-medium">  {Array.isArray(track.artists) ? track.artists.join(", ") : track.artists}
            </td>
            <td className="px-4 py-3 text-center text-sm font-medium">
              {formatListenersCount(track.listeners.length)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
