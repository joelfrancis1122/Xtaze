"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Play, Pause, Edit2, Save, X, ChevronDown } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import ArtistSidebar from "./artistComponents/artist-aside";
import { toast } from "sonner";

// Define the Song interface (aligned with backend)
interface Song {
  _id: string;
  title: string;
  fileUrl: string;
  listeners: number;
  genre?: string[];
  album?: string;
  img?: string;
  artists?: string[];
}

export function ArtistSongUpdatePage() {
  const [topSongs, setTopSongs] = useState<Song[]>([]);
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const [editingSongId, setEditingSongId] = useState<string | null>(null);
  const [editedSong, setEditedSong] = useState<Partial<Song>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const user = useSelector((state: RootState) => state.artist.signupData);
  const baseUrl = import.meta.env.VITE_BASE_URL;

  // Inject CSS for dark theme
  useEffect(() => {
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

  // Fetch songs on mount
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
        }>(`${baseUrl}/artist/getAllTracksArtist?userId=${user._id}`, {
          headers: { "Authorization": `Bearer ${token}` },
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

  // Play/Pause functionality
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
      audioRef.current.play().catch((error) => console.error("Error playing audio:", error));
      setPlayingSongId(song._id);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Start editing a song
  const startEditing = (song: Song) => {
    setEditingSongId(song._id);
    setEditedSong({
      _id: song._id,
      title: song.title,
      artists: Array.isArray(song.artists) ? song.artists.join(", ") : song.artists?.join(", ") || "",
      genre: Array.isArray(song.genre) ? song.genre.join(", ") : song.genre?.join(", ") || "",
      album: song.album || "",
    });
    setImageFile(null);
    setAudioFile(null);
  };

  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedSong((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image file change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
  };

  // Handle audio file change
  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAudioFile(file);
  };

  // Save updated song
  const saveSong = async () => {
    if (!editingSongId || !editedSong._id) return;
    const token = localStorage.getItem("artistToken");
    if (!token) {
      console.error("No token found");
      toast.error("No authentication token found. Please login.");
      return;
    }

    try {
      const formData = new FormData();

      // Always append all fields, even if unchanged
      formData.append("title", editedSong.title || "");
      formData.append("artists", Array.isArray(editedSong.artists) ? editedSong.artists.join(", ") : editedSong.artists || "");
      formData.append("genre", Array.isArray(editedSong.genre) ? editedSong.genre.join(", ") : editedSong.genre || "");
      formData.append("album", editedSong.album || "");
      if (imageFile) formData.append("img", imageFile);
      if (audioFile) formData.append("fileUrl", audioFile);

      const response = await axios.put(`${baseUrl}/artist/updateTrackByArtist?TrackId=${editingSongId}`, formData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Response:", response.data);

      if (response.data.success) {
        const updatedTrack = response.data.track as Song;
        setTopSongs((prev) =>
          prev.map((song) =>
            song._id === editingSongId ? { ...song, ...updatedTrack } : song
          )
        );
        setEditingSongId(null);
        setEditedSong({});
        setImageFile(null);
        setAudioFile(null);
        toast.success("Song updated successfully!");
      } else {
        console.error("Failed to update song:", response.data.message);
        toast.error(response.data.message || "Failed to update song.");
      }
    } catch (error) {
      console.error("Error updating song:", error);
      toast.error("An error occurred while updating the song.");
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingSongId(null);
    setEditedSong({});
    setImageFile(null);
    setAudioFile(null);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="grid lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <ArtistSidebar />

        {/* Main Content */}
        <main className="flex-1 pl-0.5 pr-4 md:pr-6 pt-5 pb-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-xl md:text-2xl font-bold">Manage Songs</h1>
              <div className="text-xs md:text-sm text-muted-foreground">Update your tracks here</div>
            </div>
            <Button variant="outline" className="gap-2 text-xs md:text-sm">
              Filter
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          <Card className="p-4 md:p-6 bg-gray-900">
            <h2 className="text-lg md:text-xl font-semibold mb-4">Your Songs</h2>
            <Table>
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold border-b">##</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold border-b">Title</th>
                  <th className="px-4 py-2 text-center text-sm font-semibold border-b">Plays</th>
                  <th className="px-4 py-2 text-center text-sm font-semibold border-b">Actions</th>
                </tr>
              </thead>
              <TableBody>
                {topSongs.length > 0 ? (
                  topSongs.map((song) => {
                    const isPlaying = playingSongId === song._id;
                    return (
                      <TableRow key={song._id} className="hover:bg-gray-700">
                        <TableCell>
                          <button onClick={() => handlePlayPause(song)} className="p-1">
                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </button>
                        </TableCell>
                        <TableCell className="text-xs md:text-sm font-medium">{song.title}</TableCell>
                        <TableCell className="text-xs md:text-sm text-center">
                          {song.listeners.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <button
                            onClick={() => startEditing(song)}
                            className="p-1 text-blue-400 hover:text-blue-300"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-xs md:text-sm py-4">
                      No tracks available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>

          {/* Edit Form (Conditional Rendering) */}
          {editingSongId && (
            <Card className="mt-6 p-4 md:p-6 bg-gray-900">
              <h3 className="text-lg md:text-xl font-semibold mb-4">Edit Song</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={editedSong.title || ""}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1">Image File</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-500"
                  />
                  {imageFile && <p className="text-xs text-gray-400 mt-1">{imageFile.name}</p>}
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1">Audio File</label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioChange}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-500"
                  />
                  {audioFile && <p className="text-xs text-gray-400 mt-1">{audioFile.name}</p>}
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1">Artists (comma-separated)</label>
                  <input
                    type="text"
                    name="artists"
                    value={editedSong.artists || ""}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1">Genre (comma-separated)</label>
                  <input
                    type="text"
                    name="genre"
                    value={editedSong.genre || ""}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1">Album</label>
                  <input
                    type="text"
                    name="album"
                    value={editedSong.album || ""}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  onClick={cancelEditing}
                  className="p-2 bg-blue-600 hover:bg-blue-500 text-xs md:text-sm flex items-center gap-1"
                >
                  <X className="h-4 w-4" /> Cancel
                </Button>
                <Button
                  onClick={saveSong}
                  className="p-2 bg-blue-600 hover:bg-blue-500 text-xs md:text-sm flex items-center gap-1"
                >
                  <Save className="h-4 w-4" /> Save
                </Button>
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}

export default ArtistSongUpdatePage;