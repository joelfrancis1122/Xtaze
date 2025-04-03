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
  _id?: string;
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

  // Pass likedSongs to useAudioPlayback
  const {
    handlePlay: baseHandlePlay,
    handleSkipBack,
    handleSkipForward,
    handleToggleShuffle,
    handleToggleRepeat,
  } = useAudioPlayback(likedSongs);

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
      if (!token || !user?._id || !user?.likedSongs || user.likedSongs.length === 0) {
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
        const tracks = await fetchLikedSongs(user._id, token, user.likedSongs);
        const sortedTracks = user.likedSongs
          .slice()
          .reverse()
          .map((trackId) => tracks.find((track) => track._id === trackId))
          .filter((track): track is Track => !!track);
        setLikedSongs(sortedTracks);
        console.log(sortedTracks, "ithan sanam");
      } catch (error) {
        toast.error("Error fetching liked songs", { position: "top-right" });
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      getLikedSongs();
    }
  }, [user?._id, user?.likedSongs, navigate]);

  useEffect(() => {
    if (!user?._id) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handlePlay = (song: Track) => {
    baseHandlePlay(song); // Use useAudioPlayback's handlePlay
    dispatch(
      setCurrentTrack({
        _id: song._id,
        title: song.title,
        artists: song.artists,
        fileUrl: song.fileUrl,
        img: song.img,
        album: song.album,
        genre: song.genre,
        listeners: song.listeners || [],
      })
    );
    dispatch(setIsPlaying(true));
  };

  const handlePlayFromModal = (track: Track) => {
    handlePlay(track);
  };

  const toggleModal = () => {
    setIsModalOpen((prevState) => !prevState);
  };

  const handleUnlike = async (trackId: string) => {
    const token = localStorage.getItem("token");
    if (!token || !trackId || !user?._id) {
      toast.error("Unable to unlike song. Please log in again.");
      return;
    }

    try {
      const updatedUser = await toggleLike(user._id, trackId, token);
      dispatch(saveSignupData(updatedUser));
      setLikedSongs((prev) => prev.filter((song) => song._id !== trackId));
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
    console.log("New order:", reorderedSongs.map((song) => song._id).reverse());
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar />
      <main className="flex-1 ml-[240px] py-16 px-10 pb-24">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-5xl font-bold">Liked Songs</h1>
            </div>
            <p className="text-gray-400 text-base">{likedSongs.length} songs</p>
          </div>
          {loading ? (
            <div className="text-center py-4 text-gray-400">Loading liked songs...</div>
          ) : likedSongs.length > 0 ? (
            <div className="bg-[#151515] rounded-xl shadow-lg border border-black-900 overflow-hidden">
              <div className="grid grid-cols-[48px_48px_2fr_1fr_1fr_48px_48px] gap-4 px-6 py-4 text-gray-400 text-lg font-semibold border-b border-gray-700">
                <span className="text-center"></span>
                <span className="text-center">#</span>
                <span>Title</span>
                <span>Artist</span>
                <span>Album</span>
                <span></span>
                <span></span>
              </div>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="likedSongs">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {likedSongs.map((song, index) => (
                        <Draggable key={song._id} draggableId={song._id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="grid grid-cols-[48px_48px_2fr_1fr_1fr_48px_48px] gap-4 px-6 py-4 hover:bg-[#212121] transition-all duration-200 cursor-pointer items-center group"
                            >
                              <div {...provided.dragHandleProps} className="flex items-center justify-center">
                                <GripVertical size={20} className="text-gray-400" />
                              </div>
                              <span className="text-gray-400 text-lg text-center">{index + 1}</span>
                              <div className="flex items-center space-x-4 truncate">
                                <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
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
                                    className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
                                  >
                                    {currentTrack?.fileUrl === song.fileUrl && isPlaying ? (
                                      <PauseCircle size={24} className="text-white" />
                                    ) : (
                                      <PlayCircle size={24} className="text-white" />
                                    )}
                                  </button>
                                </div>
                                <div className="truncate">
                                  <h3 className="text-white font-medium text-lg truncate">{song.title}</h3>
                                </div>
                              </div>
                              <span className="text-gray-400 text-lg truncate">
                                {Array.isArray(song.artists) ? song.artists.join(", ") : song.artists}
                              </span>
                              <span className="text-gray-400 text-lg truncate">{song.album}</span>
                              <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                              <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnlike(song._id);
                                  }}
                                  title="Unlike this song"
                                >
                                  <Heart size={24} className="text-red-500 fill-red-500" />
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
            <div className="bg-[#1d1d1d] p-8 rounded-xl shadow-md border border-gray-800 text-center">
              <p className="text-gray-400 text-lg">No liked songs yet. Start liking some premium tracks!</p>
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
      </main>
    </div>
  );
}