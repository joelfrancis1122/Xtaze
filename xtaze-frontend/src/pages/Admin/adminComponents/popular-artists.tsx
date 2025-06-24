
import { useEffect, useState } from "react";
import { fetchArtists } from "../../../services/adminService";
import { fetchArtistTracks } from "../../../services/adminService"; // Assuming this is available

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
    const [topArtists, setTopArtists] = useState<ArtistWithListeners[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTopArtists = async () => {
            try {
                const token = localStorage.getItem("adminToken");
                if (!token) {
                    throw new Error("No token found. Please login.");
                }

                // Fetch all artists
                const artists = await fetchArtists(token);
                console.log("Fetched Artists:", artists);

                // Filter for artists only (exclude other roles if needed)
                const artistList = artists.filter((artist: Artist) => artist.role === "artist");

                // Calculate monthly listeners for each artist
                const artistsWithListeners: ArtistWithListeners[] = await Promise.all(
                    artistList.map(async (artist: Artist) => {
                        try {
                            const tracks = await fetchArtistTracks(artist.id,token );
                            // Calculate monthly listeners (last 30 days: March 4 to April 3, 2025)
                            const relevantMonths = ["2025-03", "2025-04"];
                            const listenersSet = new Set<string>();
                            tracks.forEach((track: Track) => {
                                const hasRecentPlays = track.playHistory.some((entry) =>
                                    relevantMonths.includes(entry.month)
                                );
                                if (hasRecentPlays) {
                                    track.listeners.forEach((listener) => listenersSet.add(listener));
                                }
                            });
                            return {
                                ...artist,
                                monthlyListeners: listenersSet.size,
                            };
                        } catch (err) {
                            console.error(`Error fetching tracks for artist ${artist.name}:`, err);
                            return { ...artist, monthlyListeners: 0 };
                        }
                    })
                );

                // Sort by monthly listeners and take top 5
                const sortedArtists = artistsWithListeners
                    .sort((a, b) => b.monthlyListeners - a.monthlyListeners)
                    .slice(0, 5);

                setTopArtists(sortedArtists);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching top artists:", err);
                setError("Failed to load top artists. Please try again.");
                setLoading(false);
            }
        };

        fetchTopArtists();
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
                    <th className="px-4 py-2 text-left text-sm font-semibold border-b">Artist</th>
                    <th className="px-4 py-2 text-center text-sm font-semibold border-b">Monthly Listeners</th>
                </tr>
            </thead>

            {/* Table Body */}
            <tbody>
                {topArtists.map((artist, index) => (
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
    );
}