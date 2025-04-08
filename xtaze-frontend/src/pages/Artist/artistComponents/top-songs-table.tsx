"use client";

import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { Table, TableBody, TableCell, TableRow } from "../../../components/ui/table";
import { Play, Pause } from "lucide-react";
import { fetchArtistTracks } from "../../../services/adminService"; // Import the new service function

interface PlayHistory {
  month: string;
  plays: number;
}

interface Song {
  _id: string;
  title: string;
  fileUrl: string;
  playHistory?: PlayHistory[]; // ✅ Add play history
}

export function TopSongsTable() {
  const [topSongs, setTopSongs] = useState<Song[]>([]);
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const user = useSelector((state: RootState) => state.artist.signupData);

  useEffect(() => {
    const fetchSongs = async () => {
      const token = localStorage.getItem("artistToken");

      if (!token || !user?._id) {
        console.error("Token or User ID not found. Please login.");
        setTopSongs([]);
        return;
      }

      try {
        const tracks = await fetchArtistTracks(user._id, token);
        setTopSongs(tracks);
      } catch (error) {
        console.error("Error fetching tracks:", error);
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

  return (
    <Table>
      <thead className="bg-gray-900 text-white">
        <tr>
          <th className="px-4 py-2 text-left text-sm font-semibold border-b">##</th>
          <th className="px-4 py-2 text-left text-sm font-semibold border-b">Title</th>
          <th className="px-4 py-2 text-center text-sm font-semibold border-b">Total Plays</th>
        </tr>
      </thead>
      <TableBody className="space-y-4"> {/* Adds spacing between rows */}
  {topSongs.length > 0 ? (
    topSongs.map((song) => {
      const isPlaying = playingSongId === song._id;

      // ✅ Calculate total plays across all months
      const totalPlays = song.playHistory?.reduce((sum, record) => sum + record.plays, 0) || 0;

      return (
        <TableRow key={song._id} className="text-lg"> {/* Increased font size */}
          <TableCell className="py-4"> {/* Adds vertical padding for spacing */}
            <button onClick={() => handlePlayPause(song)}>
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />} {/* Increased icon size */}
            </button>
          </TableCell>
          <TableCell className="font-medium py-4">{song.title}</TableCell>
          <TableCell className="py-4">{totalPlays.toLocaleString()}</TableCell>
        </TableRow>
      );
    })
  ) : (
    <TableRow className="text-lg"> {/* Increased font size for "No tracks" message */}
      <TableCell colSpan={4} className="text-center py-4">
        No tracks available.
      </TableCell>
    </TableRow>
  )}
</TableBody>

    </Table>
  );
}
