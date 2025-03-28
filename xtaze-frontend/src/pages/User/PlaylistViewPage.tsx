import { useEffect, useState, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Clock, Heart, MoreHorizontal, Play, PauseCircle, PlayCircle, Share2, Shuffle, ChevronLeft } from "lucide-react";
import Sidebar from "./userComponents/SideBar";
import { fetchPlaylistTracks, deletePlaylist, updatePlaylistName, updatePlaylistImage, getMyplaylist } from "../../services/userService";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { setCurrentTrack, setIsPlaying } from "../../redux/audioSlice";
import { audio, audioContext, updateEqualizer } from "../../utils/audio";
import MusicPlayer from "./userComponents/TrackBar";
import image from "../../assets/ab67706f0000000216605bf6c66f6e5a783411b8.jpeg";
import PreviewModal from "./PreviewPage";
import { toast } from "sonner";
import { Playlist } from "./types/IPlaylist";
import { Track } from "./types/ITrack";
import { useAudioPlayback } from "./userComponents/audioPlayback";

export default function PlaylistPageView() {
  const { userId, id } = useParams();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [totalTracks, setTotalTracks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [description, setPlaylistDes] = useState("");
  const [playlistImage, setPlaylistImage] = useState(image);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;
  const { currentTrack, isPlaying, isShuffled, isRepeating } = useSelector((state: RootState) => state.audio);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    handlePlay: baseHandlePlay,
    handleSkipBack,
    handleToggleShuffle,
    handleToggleRepeat,
    handleSkipForward,
  } = useAudioPlayback(tracks);

  // Share handler
  const handleShare = () => {
    const playlistUrl = `${window.location.origin}/playlist/${userId}/${id}`;
    const shareMessage = `Check out my playlist: ${playlistUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(whatsappUrl, "_blank");
  };

  useEffect(() => {
    if (!audioContext) return;

    const resumeAudioContext = () => {
      if (audioContext && audioContext.state === "suspended") {
        audioContext.resume().then(() => console.log("AudioContext resumed"));
      }
    };
    document.addEventListener("click", resumeAudioContext, { once: true });

    audio.crossOrigin = "anonymous";
    if (!audio.src) {
      audio.src = "/music/test.mp3";
      audio.loop = true;
    }

    const savedEqualizerValues = localStorage.getItem("equalizerValues");
    if (savedEqualizerValues) {
      updateEqualizer(JSON.parse(savedEqualizerValues));
    }

    const savedVolume = localStorage.getItem("volume");
    const savedIsMuted = localStorage.getItem("isMuted");
    if (savedVolume && savedIsMuted) audio.volume = JSON.parse(savedIsMuted) ? 0 : Number(savedVolume) / 100;

    return () => {
      document.removeEventListener("click", resumeAudioContext);
    };
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        const { tracks: initialTracks, total } = await fetchPlaylistTracks(id as string, 1, limit);
        setTracks(initialTracks || []);
        setTotalTracks(total || 0);
        setPage(2);
        setHasMore(initialTracks.length > 0 && initialTracks.length < total);

        if (userId) {
          const playlistsResponse = await getMyplaylist(userId);
          setPlaylists(playlistsResponse);
          const matchedPlaylist = playlistsResponse.find((playlist) => playlist._id?.toString() === id?.toString());
          if (matchedPlaylist) {
            setPlaylistName(matchedPlaylist.title || "Unnamed Playlist");
            setPlaylistImage(matchedPlaylist.imageUrl || image);
            setPlaylistDes(matchedPlaylist.description || "");
          } else {
            setPlaylistName("Unnamed Playlist");
          }
        }

        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load playlist data");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id, userId]);

  useEffect(() => {
    const handleScroll = async () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
        hasMore &&
        !loadingMore
      ) {
        setLoadingMore(true);
        try {
          const { tracks: newTracks, total } = await fetchPlaylistTracks(id as string, page, limit);
          setTracks((prev) => [...prev, ...(newTracks || [])]);
          setPage((prev) => prev + 1);
          setHasMore(newTracks.length > 0 && tracks.length + newTracks.length < total);
        } catch (err) {
          console.error(err);
          setError("Failed to load more tracks");
        } finally {
          setLoadingMore(false);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, hasMore, loadingMore, id, tracks.length]);

  const handlePlay = (track: Track) => {
    baseHandlePlay(track); 
    dispatch(setCurrentTrack(track));
    dispatch(setIsPlaying(true));
  };

  const handlePlayFromModal = (track: Track) => {
    handlePlay(track);
  };

  const toggleModal = () => {
    setIsModalOpen((prev) => !prev);
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleDeletePlaylist = async () => {
    try {
      await deletePlaylist(id as string);
      navigate(-1);
    } catch (err) {
      console.error("Failed to delete playlist:", err);
      setError("Failed to delete playlist");
    }
  };

  const handleNameEdit = async () => {
    if (isEditingName) {
      try {
        await updatePlaylistName(id as string, playlistName);
        setIsEditingName(false);
      } catch (err) {
        console.error("Failed to update playlist name:", err);
        setError("Failed to update name");
      }
    } else {
      setIsEditingName(true);
    }
  };

  const handleImageUpdate = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const updatedImageUrl = await updatePlaylistImage(id as string, file);
        if (updatedImageUrl) setPlaylistImage(updatedImageUrl?.data?.imageUrl);
        toast.success("Playlist cover changed");
      } catch (err) {
        console.error("Failed to update playlist image:", err);
        setError("Failed to update image");
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <div className="flex-1 ml-64 py-7 px-6 pb-20">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition mb-4"
          title="Go back"
        >
          <ChevronLeft className="h-5 w-5 text-gray-400" />
        </button>
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-60 h-60 rounded-xl overflow-hidden shadow-lg relative">
                <img
                  src={playlistImage}
                  alt="Playlist cover"
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => document.getElementById("imageUpload")?.click()}
                />
                <input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpdate}
                />
              </div>
              <div>
                <p className="text-sm text-gray-400 uppercase">Playlist</p>
                {isEditingName ? (
                  <input
                    type="text"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    onBlur={handleNameEdit}
                    onKeyPress={(e) => e.key === "Enter" && handleNameEdit()}
                    className="text-5xl font-bold bg-transparent border-b border-gray-400 text-white outline-none"
                    autoFocus
                  />
                ) : (
                  <h1
                    className="text-5xl font-bold cursor-pointer hover:text-gray-400"
                    onClick={handleNameEdit}
                  >
                    {playlistName}
                  </h1>
                )}
                <p className="text-gray-400 text-base mt-2">{description}</p>
              </div>
            </div>
            <p className="text-gray-400 text-base">{totalTracks} songs</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleShare}
              className="ml-auto w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <div className="relative">
              <button
                onClick={toggleMenu}
                className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10">
                  <button
                    onClick={handleDeletePlaylist}
                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                  >
                    Delete Playlist
                  </button>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <p className="text-gray-400 text-center py-4">Loading tracks...</p>
          ) : error ? (
            <p className="text-red-400 text-center py-4">{error}</p>
          ) : tracks.length > 0 ? (
            <div className="bg-[#151515] rounded-xl shadow-lg border border-gray-900 overflow-hidden">
              <div className="grid grid-cols-[48px_2fr_1fr_1fr_48px] gap-4 px-6 py-4 text-gray-400 text-lg font-semibold border-b border-gray-700">
                <span className="text-center">#</span>
                <span>Title</span>
                <span>Artist</span>
                <span>Album</span>
                {/* <span className="text-right"><Clock className="h-4 w-4" /></span> */}
              </div>
              {tracks.map((track, index) => (
                <div
                  key={track._id}
                  className="grid grid-cols-[48px_2fr_1fr_1fr_48px] gap-4 px-6 py-4 hover:bg-[#212121] transition-all duration-200 cursor-pointer items-center group"
                >
                  <span className="text-gray-400 text-lg text-center">{index + 1}</span>
                  <div className="flex items-center space-x-4 truncate">
                    <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={track.img || "/placeholder.svg"}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handlePlay(track)}
                        className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
                      >
                        {currentTrack?.fileUrl === track.fileUrl && isPlaying ? (
                          <PauseCircle size={24} className="text-white" />
                        ) : (
                          <PlayCircle size={24} className="text-white" />
                        )}
                      </button>
                    </div>
                    <div className="truncate">
                      <p className="text-white font-medium text-lg truncate">{track.title}</p>
                    </div>
                  </div>
                  <span className="text-gray-400 text-lg truncate">
                    {Array.isArray(track.artists) ? track.artists.join(", ") : track.artists}
                  </span>
                  <span className="text-gray-400 text-lg truncate">{track.album}</span>
                  <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </div>
              ))}
              {loadingMore && (
                <p className="text-gray-400 text-center py-4">Loading more tracks...</p>
              )}
            </div>
          ) : (
            <div className="bg-[#1d1d1d] p-8 rounded-xl shadow-md border border-gray-800 text-center">
              <p className="text-gray-400 text-lg">No tracks in this playlist yet.</p>
            </div>
          )}
        </div>

        {currentTrack && (
          <MusicPlayer
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            handlePlay={handlePlay}
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
    </div>
  );
}