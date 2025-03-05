"use client";

import { useState, useEffect } from "react";
import Sidebar from "./userComponents/SideBar";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { PlayCircle } from "lucide-react"; // Optional: Add icons like Spotify’s play button

// Sample playlist data (replace with API call)
const initialPlaylists = [
  { id: "1", name: "Chill Vibes", songCount: 12, description: "Relax and unwind" },
  { id: "2", name: "Workout Hits", songCount: 8, description: "Pump it up" },
  { id: "3", name: "Late Night Tunes", songCount: 15, description: "After hours vibes" },
];

export default function PlaylistsPage() {
  const user = useSelector((state: RootState) => state.user.signupData);
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState(initialPlaylists);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const baseUrl = import.meta.env.VITE_BASE_URL;
  // Redirect if not logged in and fetch playlists
  useEffect(() => {
    if (!user?._id) {
      navigate("/", { replace: true });
    } else {
      // Fetch playlists from backend (example API call)
      /*
      axios
        .get("http://localhost:3000/user/playlists", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((response) => setPlaylists(response.data))
        .catch((error) => toast.error("Error fetching playlists: " + error.message));
      */
    }
  }, [user, navigate]);

  const handleAddPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) {
      toast.error("Playlist name cannot be empty.", { position: "top-right" });
      return;
    }

    try {
      const response = await axios.post(
        `${baseUrl}/user/playlists`,
        { name: newPlaylistName },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setPlaylists([...playlists, { id: response.data.id, name: newPlaylistName, songCount: 0, description: "" }]);
      setNewPlaylistName("");
      setShowAddForm(false);
      toast.success("Playlist added successfully!", { position: "top-right" });
    } catch (error: any) {
      toast.error("Error adding playlist: " + error.message, { position: "top-right" });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar />
      <main className="flex-1 ml-64 py-8 px-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Playlists</h1>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-white text-black px-4 py-2 rounded-full font-semibold hover:bg-gray-200 transition-all duration-200 ease-in-out"
            >
              Create Playlist
            </button>
          </div>

          {/* Playlist Listing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {playlists.length > 0 ? (
              playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="bg-[#181818] p-4 rounded-lg shadow-md hover:bg-[#282828] transition-all duration-200 cursor-pointer group relative"
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                >
                  {/* Placeholder for cover image */}
                  <div className="w-full h-40 bg-gray-700 rounded-md mb-4 flex items-center justify-center text-gray-400">
                    Cover
                  </div>
                  <h3 className="text-lg font-semibold text-white truncate">{playlist.name}</h3>
                  <p className="text-sm text-gray-400 truncate">{playlist.description || `${playlist.songCount} songs`}</p>
                  {/* Play button on hover */}
                  <button className="absolute bottom-6 right-6 bg-green-500 text-black rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <PlayCircle size={24} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center col-span-full">No playlists found. Create one to get started!</p>
            )}
          </div>

          {/* Add Playlist Modal */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
              <div className="bg-[#282828] p-6 rounded-lg w-full max-w-sm space-y-6">
                <h2 className="text-xl font-bold text-white">Create a Playlist</h2>
                <form onSubmit={handleAddPlaylist} className="space-y-4">
                  <div>
                    <label htmlFor="playlistName" className="text-gray-300 text-sm">Name</label>
                    <input
                      id="playlistName"
                      type="text"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      className="w-full mt-1 p-3 bg-[#3e3e3e] text-white border-none rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter playlist name"
                    />
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="text-gray-400 px-4 py-2 hover:text-white transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-green-500 text-black px-4 py-2 rounded-full font-semibold hover:bg-green-600 transition-all duration-200 ease-in-out"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}