import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MoreHorizontal, Plus, Search, Play } from "lucide-react";
import { Input } from "../../components/ui/input";
import Sidebar from "./userComponents/SideBar";
import { toast } from "sonner";
import { createPlaylists, getMyplaylist } from "../../services/userService";
import image from "../../assets/ab67706f0000000216605bf6c66f6e5a783411b8.jpeg"
interface Playlist {
  [x: string]: any;
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  trackCount: number;
  createdBy: string;
  
}

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dropdownOpenId, setDropdownOpenId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { userId } = useParams(); // Assuming route is /playlists/:_id

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;

    const newPlaylist: Playlist = {
      id: playlists.length + 1,
      title: newPlaylistName,
      description: newPlaylistDescription || "New playlist",
      imageUrl: "/placeholder.svg?height=200&width=200",
      trackCount: 0,
      createdBy: userId || "unknown", // Fallback if _id is undefined
    };

    try {
      await createPlaylists(userId || "unknown", newPlaylist);
      setPlaylists([...playlists, newPlaylist]);
      setNewPlaylistName("");
      setNewPlaylistDescription("");
      setIsDialogOpen(false);
      navigate(`/playlist/${userId || "unknown"}`);
      toast.success("Playlist created successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to create playlist");
    }
  };
  useEffect(() => {
    const getPlaylist = async () => {
      try {
        console.log(userId, "ithan userid");
        const response = await getMyplaylist(userId as string);
        console.log(response, "ithan response ketto");
        setPlaylists(response); // Update state with fetched playlists
      } catch (error) {
        console.log(error);
        toast.error("Failed to load playlists");
      }
    };
    if (userId) getPlaylist(); // Only run if userId exists
  }, [userId]); // Dependency array
  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <div className="flex-1 ml-64 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-5xl font-bold">Your Playlists</h1>

          <button
            onClick={() => setIsDialogOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Create Playlist
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {playlists.length > 0 ? (
            playlists.map((playlist) => (
              <Link
                key={playlist.id}
                to={`/playlist/${userId}/${playlist._id}`}
                className="group relative flex flex-col bg-gray-900 p-4 rounded-lg shadow-lg hover:bg-gray-800 transition"
              >
                <div className="relative w-full h-40 overflow-hidden rounded-md">
                  <img
                    src={image||playlist.imageUrl }
                    alt={playlist.title}
                    className="w-full h-full object-cover rounded-md"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition" />
                  <button className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition">
                    <Play className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">{playlist.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{playlist.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {playlist.trackCount} tracks • Created by {playlist.createdBy}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-400">No playlists yet. Create one to get started!</p>
          )}
        </div>

        {isDialogOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold">Create New Playlist</h2>
              <div className="grid gap-4 py-4">
                <Input
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Playlist Name"
                  className="w-full p-2 border rounded bg-gray-800 text-white"
                />
                <Input
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  placeholder="Description"
                  className="w-full p-2 border rounded bg-gray-800 text-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePlaylist}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}