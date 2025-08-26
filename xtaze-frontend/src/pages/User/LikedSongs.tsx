import { useState, useEffect } from "react";
import Sidebar from "./userComponents/SideBar";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PlayCircle, PauseCircle, Heart, GripVertical } from "lucide-react";
import { audio, audioContext, updateEqualizer } from "../../utils/audio";
import { setCurrentTrack, setIsPlaying } from "../../redux/audioSlice";
import { saveSignupData } from "../../redux/userSlice";
import { Track } from "./types/ITrack";
import { fetchLikedSongs, toggleLike } from "../../services/userService";
import MusicPlayer from "./userComponents/TrackBar";
import PreviewModal from "./PreviewPage";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { useAudioPlayback } from "./userComponents/audioPlayback";

interface UserSignupData {
  id?: string;
  username: string;
  country: string;
  gender: string;
  year: string;
  phone: string;
  email: string;
  role?: string;
  isActive?: boolean;
  premium?: boolean;
  profilePic?: string;
  likedSongs?: string[];
}

export default function LikedSongsPage() {
  const user = useSelector((state: RootState) => state.user.signupData) as UserSignupData | null;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [likedSongs, setLikedSongs] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentTrack, isPlaying, isShuffled, isRepeating } = useSelector((state: RootState) => state.audio);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { handlePlay: baseHandlePlay, handleSkipBack, handleSkipForward, handleToggleShuffle, handleToggleRepeat } =
    useAudioPlayback(likedSongs);

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
    const getLikedSongs = async () => {
      const token = localStorage.getItem("token");
      if (!token || !user?.id || !user?.likedSongs || user.likedSongs.length === 0) {
        setLikedSongs([]);
        setLoading(false);
        return;
      }
      if (user.premium === false) {
        toast.error("You have to be a premium user for this functionality");
        setLikedSongs([]);
        setLoading(false);
        return;
      }

      try {
        const tracks = await fetchLikedSongs(user.id, user.likedSongs);
        const sortedTracks = user.likedSongs
          .slice()
          .reverse()
          .map((trackId) => tracks.find((track) => track.id === trackId))
          .filter((track): track is Track => !!track);
        setLikedSongs(sortedTracks);
      } catch (error) {
        toast.error("Error fetching liked songs", { position: "top-right" });
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      getLikedSongs();
    }
  }, [user?.id, user?.likedSongs, navigate]);

  useEffect(() => {
    if (!user?.id) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handlePlay = (track: Track) => {
    if (currentTrack?.fileUrl === track.fileUrl) {
      if (isPlaying) {
        audio.pause();
        dispatch(setIsPlaying(false));
      } else {
        audio.play().then(() => dispatch(setIsPlaying(true))).catch((err) => console.error("Playback error:", err));
      }
    } else {
      dispatch(setCurrentTrack(track));
      audio.src = track.fileUrl;
      audio.play().then(() => dispatch(setIsPlaying(true))).catch((err) => console.error("Playback error:", err));
    }
  };

  const handlePlayFromModal = (track: Track) => {
    handlePlay(track);
  };

  const toggleModal = () => {
    setIsModalOpen((prevState) => !prevState);
  };

  const handleUnlike = async (trackId: string) => {
    const token = localStorage.getItem("token");
    if (!token || !trackId || !user?.id) {
      toast.error("Unable to unlike song. Please log in again.");
      return;
    }

    try {
      const updatedUser = await toggleLike(user.id, trackId);
      dispatch(saveSignupData(updatedUser));
      setLikedSongs((prev) => prev.filter((song) => song.id !== trackId));
      toast.success("Song removed from liked songs!");
    } catch (error) {
      console.error("Error unliking song:", error);
      toast.error("Failed to unlike song.", { position: "top-right" });
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reorderedSongs = Array.from(likedSongs);
    const [movedSong] = reorderedSongs.splice(result.source.index, 1);
    reorderedSongs.splice(result.destination.index, 0, movedSong);

    setLikedSongs(reorderedSongs);
    console.log("New order:", reorderedSongs.map((song) => song.id).reverse());
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      <main className="flex-1 md:ml-[240px] py-6 sm:py-16 px-4 sm:px-10 pb-24 transition-all duration-300">
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
          <span className="text-white">Liked Songs</span>
        </nav>
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            <h1 className="text-3xl sm:text-5xl font-bold">Liked Songs</h1>
            <p className="text-gray-400 text-sm sm:text-base">{likedSongs.length} songs</p>
          </div>
          {loading ? (
            <div className="text-center py-4 text-sm sm:text-base text-gray-400">
              Loading liked songs...
            </div>
          ) : likedSongs.length > 0 ? (
            <div className="bg-[#151515] rounded-xl shadow-lg border border-black-900 overflow-hidden">
              <div className="hidden md:grid grid-cols-[48px_48px_2fr_1fr_1fr_48px_48px] gap-4 px-6 py-4 text-gray-400 text-lg font-semibold border-b border-gray-700">
                <span className="text-center"></span>
                <span className="text-center">#</span>
                <span>Title</span>
                <span>Artist</span>
                <span>Album</span>
                <span></span>
                <span></span>
              </div>
              <div className="md:hidden grid grid-cols-[32px_2fr_48px] gap-2 px-4 py-2 text-gray-400 text-sm font-semibold border-b border-gray-700">
                <span className="text-center">#</span>
                <span>Title</span>
                <span></span>
              </div>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="likedSongs">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {likedSongs.map((song, index) => (
                        <Draggable key={song.id} draggableId={song.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="md:grid md:grid-cols-[48px_48px_2fr_1fr_1fr_48px_48px] md:gap-4 grid grid-cols-[32px_2fr_48px] gap-2 px-4 sm:px-6 py-2 sm:py-4 hover:bg-[#212121] active:bg-[#212121] transition-colors duration-200 cursor-pointer items-center group box-content"
                            >
                              <div
                                {...provided.dragHandleProps}
                                className="hidden md:flex items-center justify-center"
                              >
                                <GripVertical size={20} className="text-gray-400" />
                              </div>
                              <span className="text-gray-400 text-sm sm:text-lg text-center">{index + 1}</span>
                              <div className="flex items-center space-x-2 sm:space-x-4 truncate">
                                <div className="relative w-10 sm:w-12 h-10 sm:h-12 rounded-md overflow-hidden flex-shrink-0">
                                  <img
                                    src={song.img || "/placeholder.svg"}
                                    alt={song.title}
                                    className="w-full h-full object-cover"
                                  />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePlay(song);
                                    }}
                                    className="absolute inset-0 flex items-center justify-center bg-black/70 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity duration-200 rounded-md box-content"
                                  >
                                    {currentTrack?.fileUrl === song.fileUrl && isPlaying ? (
                                      <PauseCircle size={20} className="text-white" />
                                    ) : (
                                      <PlayCircle size={20} className="text-white" />
                                    )}
                                  </button>
                                </div>
                                <div className="truncate">
                                  <h3 className="text-white font-medium text-sm sm:text-lg truncate">{song.title}</h3>
                                  <p className="text-gray-400 text-xs sm:text-sm truncate md:hidden">
                                    {Array.isArray(song.artists) ? song.artists.join(", ") : song.artists}
                                  </p>
                                </div>
                              </div>
                              <span className="text-gray-400 text-sm sm:text-lg truncate hidden md:block">
                                {Array.isArray(song.artists) ? song.artists.join(", ") : song.artists}
                              </span>
                              <span className="text-gray-400 text-sm sm:text-lg truncate hidden md:block">
                                {song.album}
                              </span>
                              <div className="hidden md:flex items-center justify-end md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200"></div>
                              <div className="flex items-center justify-end md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity duration-200">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnlike(song.id);
                                  }}
                                  title="Unlike this song"
                                  className="p-2 rounded-full hover:bg-[#333333] active:bg-[#333333] transition-colors duration-200 box-content"
                                >
                                  <Heart size={20} className="text-red-500 fill-red-500" />
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          ) : (
            <div className="bg-[#1d1d1d] p-4 sm:p-8 rounded-xl shadow-md border border-gray-800 text-center">
              <p className="text-gray-400 text-sm sm:text-lg">
                No liked songs yet. Start liking some premium tracks!
              </p>
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
      </main>
    </div>
  );
}