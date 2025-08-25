import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { Table, TableBody, TableCell, TableRow, TableHeader, TableHead } from "../../../components/ui/table";
import { Play, Pause } from "lucide-react";
import { fetchArtistTracks } from "../../../services/artistService";
import { Button } from "../../../components/ui/button";

interface PlayHistory {
  month: string;
  plays: number;
}

interface Song {
  _id: string;
  title: string;
  fileUrl: string;
  playHistory?: PlayHistory[];
}

export function TopSongsTable() {
  const [topSongs, setTopSongs] = useState<Song[]>([]);
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(5);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const user = useSelector((state: RootState) => state.artist.signupData);

  useEffect(() => {
    const fetchSongs = async () => {
      const token = localStorage.getItem("artistToken");
      if (!token || !user?._id) {
        setError("Token or User ID not found. Please login.");
        setTopSongs([]);
        return;
      }

      try {
        const { data, pagination } = await fetchArtistTracks(user._id, page, limit);
        setTopSongs(data || []);
        setTotalPages(pagination?.totalPages || 1);
      } catch (error) {
        console.error("Error fetching tracks:", error);
        setError("Failed to fetch tracks");
        setTopSongs([]);
      }
    };

    fetchSongs();
  }, [user?._id, page, limit]);

  const handlePlayPause = (song: Song) => {
    if (!audioRef.current) {
      audioRef.current = new Audio(song.fileUrl);
    }

    if (playingSongId === song._id) {
      audioRef.current.pause();
      setPlayingSongId(null);
    } else {
      if (playingSongId !== null && audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      audioRef.current.src = song.fileUrl;
      audioRef.current.play().catch(console.error);
      setPlayingSongId(song._id);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <>
      <Table>
        <TableHeader className="bg-black text-white">
          <TableRow>
            <TableHead className="w-24 text-left">Play</TableHead>
            <TableHead className="text-left">Song Title</TableHead>
            <TableHead className="text-left">Total Plays</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {topSongs.length > 0 ? (
            topSongs.map((song) => (
              <TableRow key={song._id} className="text-lg">
                <TableCell className="py-4">
                  <button onClick={() => handlePlayPause(song)}>
                    {playingSongId === song._id ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </button>
                </TableCell>
                <TableCell className="font-medium py-4">{song.title}</TableCell>
                <TableCell className="py-4">
                  {(
                    song.playHistory?.reduce((sum, record) => sum + record.plays, 0) || 0
                  ).toLocaleString()}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow className="text-lg">
              <TableCell colSpan={3} className="text-center py-4">
                No tracks available.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center mt-4">
        <Button disabled={page === 1} onClick={() => setPage((prev) => Math.max(prev - 1, 1))}>
          Previous
        </Button>
        <span className="text-gray-400">
          Page {page} of {totalPages}
        </span>
        <Button
          disabled={page === totalPages || totalPages === 0}
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
        >
          Next
        </Button>
      </div>
    </>
  );
}
