import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Play } from "lucide-react";
import { Input } from "../../components/ui/input";
import Sidebar from "./userComponents/SideBar";
import { toast } from "sonner";
import { createPlaylists, getMyplaylist } from "../../services/userService";
import image from "../../assets/ab67706f0000000216605bf6c66f6e5a783411b8.jpeg";
import { Playlist } from "./types/IPlaylist";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import MusicPlayer from "./userComponents/TrackBar";
import { useAudioPlayback } from "./userComponents/audioPlayback";
import { Track } from "./types/ITrack";
import { audio } from "../../utils/audio";
import PreviewModal from "./PreviewPage";

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { currentTrack, isPlaying, isShuffled, isRepeating } = useSelector((state: RootState) => state.audio);
  const {
    handlePlay: baseHandlePlay,
    handleSkipBack,
    handleSkipForward,
    handleToggleShuffle,
    handleToggleRepeat,
  } = useAudioPlayback([]);

  const navigate = useNavigate();
  const { userId } = useParams();

  const toggleModal = () => {
    setIsModalOpen((prevState) => !prevState);
  };

  const handlePlayFromModal = (track: Track) => {
    baseHandlePlay(track);
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;

    const newPlaylist = {
      title: newPlaylistName,
      description: newPlaylistDescription || "New playlist",
      imageUrl: null,
      createdBy: userId || "unknown",
      tracks: [],
    };

    try {
      const createdPlaylist = await createPlaylists(userId || "unknown", newPlaylist);
      if (!createdPlaylist.id) {
        throw new Error("Playlist ID missing from response");
      }
      setPlaylists([...playlists, createdPlaylist]);
      setNewPlaylistName("");
      setNewPlaylistDescription("");
      setIsDialogOpen(false);
      toast.success("Playlist created successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to create playlist");
    }
  };

  useEffect(() => {
    const getPlaylist = async () => {
      try {
        const response = await getMyplaylist(userId as string);
        setPlaylists(response);
      } catch (error) {
        toast.error("Failed to load playlists");
      }
    };
    if (userId) getPlaylist();
  }, [userId]);

  return (
    <div className="flex min-h-screen bg-black text-white px-4">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      <div className="flex-1 md:ml-[240px] px-4 sm:px-6 py-4 sm:py-6 pb-20 overflow-y-auto">
        <nav className="md:hidden text-sm text-gray-400 mb-4 sm:mb-6">
          <a
            href="/home"
            className="hover:text-white transition-colors"
            onClick={(e) => {
              e.preventDefault();
              navigate("/home");
            }}
          >
            Home
          </a>
          <span className="mx-2"></span>
          <span className="text-white">Playlists</span>
        </nav>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <h1 className="text-3xl sm:text-5xl font-bold">Your Playlists</h1>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-700 flex items-center gap-2 text-sm sm:text-base"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" /> Create Playlist
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 overflow-hidden">
          {playlists.length > 0 ? (
            playlists.map((playlist) => (
              <div
                key={playlist.id}
                onClick={() => navigate(`/playlist/${userId}/${playlist.id}`)}
                className="group relative flex flex-col bg-gray-900 p-3 sm:p-4 rounded-lg shadow-lg hover:bg-gray-800 active:bg-gray-800 transition-colors duration-200 cursor-pointer box-content"
              >
                <div className="relative w-full h-32 sm:h-40 overflow-hidden rounded-md">
                  <img
                    src={playlist?.imageUrl || image}
                    alt={playlist?.title}
                    className="w-full h-full object-cover rounded-md"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-200" />
                  <button className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 sm:p-3 rounded-full md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity duration-200">
                    <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
                <div className="mt-3 sm:mt-4">
                  <h3 className="text-base sm:text-lg font-semibold truncate">{playlist.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1 truncate">{playlist.description}</p>
                  <p className="text-xs text-gray-500 mt-1 sm:mt-2 truncate">
                    {playlist.tracks.length} tracks • Created by {playlist.createdBy}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm sm:text-base col-span-full">No playlists yet. Create one to get started!</p>
          )}
        </div>

        {isDialogOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-4 sm:p-6 rounded-lg shadow-lg w-[90%] max-w-sm sm:max-w-md">
              <h2 className="text-lg sm:text-xl font-bold mb-4">Create New Playlist</h2>
              <div className="grid gap-3 sm:gap-4">
                <Input
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Playlist Name"
                  className="w-full p-2 sm:p-3 border rounded bg-gray-800 text-white text-sm sm:text-base"
                />
                <Input
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  placeholder="Description"
                  className="w-full p-2 sm:p-3 border rounded bg-gray-800 text-white text-sm sm:text-base"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4 sm:mt-6">
                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-600 text-white rounded hover:bg-gray-700 active:bg-gray-700 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePlaylist}
                  className="px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 text-white rounded hover:bg-blue-700 active:bg-blue-700 text-sm sm:text-base"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {currentTrack && (
        <MusicPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          handlePlay={baseHandlePlay}
          handleSkipBack={handleSkipBack}
          handleSkipForward={handleSkipForward}
          toggleShuffle={handleToggleShuffle}
          toggleRepeat={handleToggleRepeat}
          isShuffled={isShuffled}
          isRepeating={isRepeating}
          audio={audio}
          toggleModal={toggleModal}
        />
      )}
      {currentTrack && (
        <PreviewModal
          track={currentTrack}
          isOpen={isModalOpen}
          toggleModal={toggleModal}
          onPlayTrack={handlePlayFromModal}
        />
      )}
    </div>
  );
}