import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { Table, TableBody, TableCell, TableRow, TableHeader } from "../../../components/ui/table";
import { Play, Pause } from "lucide-react";
import { fetchArtistTracks } from "../../../services/adminService";

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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const user = useSelector((state: RootState) => state.artist.signupData);

  useEffect(() => {
    const fetchSongs = async () => {
      const token = localStorage.getItem("artistToken");
      console.log("User ID:", user?._id, "Token:", token);

      if (!token || !user?._id) {
        setError("Token or User ID not found. Please login.");
        setTopSongs([]);
        return;
      }

      try {
        const tracks = await fetchArtistTracks(user._id);
        setTopSongs(tracks);
      } catch (error) {
        console.error("Error fetching tracks:", error);
        setError("Failed to fetch tracks");
        setTopSongs([]);
      }
    };

    fetchSongs();
  }, [user?._id]);

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
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
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
    <Table>
      <TableHeader className="bg-black text-white">
  
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
                {(song.playHistory?.reduce((sum, record) => sum + record.plays, 0) || 0).toLocaleString()}
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
  );
}