"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { Table, TableBody, TableCell, TableRow } from "../../../components/ui/table";
import { Play, Pause } from "lucide-react";

// Define the Song type based on your API response
interface Song {
  _id: string;
  title: string;
  fileUrl: string;
  listeners: number;
  duration?: string;
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
        return;
      }

      try {
        const response = await axios.get<{
          success: boolean;
          tracks?: Song[];
          message?: string;
        }>(`http://localhost:3000/artist/getAllTracksArtist?userId=${user._id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.data.success && Array.isArray(response.data.tracks)) {
          setTopSongs(response.data.tracks);
        } else {
          console.error("Failed to fetch tracks:", response.data.message);
          setTopSongs([]);
        }
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
          <th className="px-4 py-2 text-center text-sm font-semibold border-b">Plays</th>
          <th className="px-4 py-2 text-center text-sm font-semibold border-b">Duration</th>
        </tr>
      </thead>
      <TableBody>{topSongs.length > 0 ? topSongs.map((song) => {
        const isPlaying = playingSongId === song._id;
        return (
          <TableRow key={song._id}>
            <TableCell>
              <button onClick={() => handlePlayPause(song)}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
            </TableCell>
            <TableCell className="font-medium">{song.title}</TableCell>
            <TableCell>{song.listeners.toLocaleString()}</TableCell>
            <TableCell>{song.duration || "N/A"}</TableCell>
          </TableRow>
        );
      }) : <TableRow><TableCell colSpan={4} className="text-center">No tracks available.</TableCell></TableRow>}</TableBody>
    </Table>
  );
}