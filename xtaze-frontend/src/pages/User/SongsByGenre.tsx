import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Play, Pause, Plus, Heart, Download, ListMusic } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import Sidebar from "./userComponents/SideBar";
import { fetchGenreTracks, toggleLike, addTrackToPlaylist, getMyplaylist } from "../../services/userService";
import { Track } from "./types/ITrack";
import { setCurrentTrack, setIsPlaying, setCurrentTime, setDuration } from "../../redux/audioSlice";
import { audio, audioContext, updateEqualizer } from "../../utils/audio";
import { useAudioPlayback } from "./userComponents/audioPlayback";
import MusicPlayer from "./userComponents/TrackBar";
import PreviewModal from "./PreviewPage";
import { toast } from "sonner";
import { Playlist } from "./types/IPlaylist";
import { UserSignupData } from "./types/IUser";
import { saveSignupData } from "../../redux/userSlice";

export default function GenrePage() {
  const { currentTrack, isPlaying, isShuffled, isRepeating } = useSelector(
    (state: RootState) => state.audio
  );
  const user = useSelector((state: RootState) => state.user.signupData) as UserSignupData | null;
  const dispatch = useDispatch();
  const { genre } = useParams<{ genre: string }>();
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [genreName, setGenreName] = useState<string>(genre || "");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set());
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [dropdownTrackId, setDropdownTrackId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const {
    handlePlay: baseHandlePlay,
    handleSkipBack,
    handleSkipForward,
    handleToggleShuffle,
    handleToggleRepeat,
  } = useAudioPlayback(tracks);

  const toggleModal = () => setIsModalOpen((prev) => !prev);
  const handlePlayFromModal = (track: Track) => {
    handlePlay(track);
  };

  // Audio context setup
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

  // Sync likedSongs from user data
  useEffect(() => {
    if (user?.likedSongs) {
      setLikedSongs(new Set(user.likedSongs.map(String) || []));
    }
  }, [user?.likedSongs]);

  // Fetch genre tracks and playlists
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token || !user?._id) {
        console.error("No token or user ID found. Please login.");
        return;
      }

      try {
        const genreTracks = await fetchGenreTracks(genre || "");
        console.log(`Tracks for genre ${genre}:`, genreTracks);
        setTracks(genreTracks);
        setGenreName(genre || "");

        const fetchedPlaylists = await getMyplaylist(user._id);
        setPlaylists(fetchedPlaylists);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [genre, user?._id]);

  // Audio playback logic
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = audio;
      console.log("Audio initialized:", audioRef.current);
    }

    const audioElement = audioRef.current;
    if (!audioElement || !currentTrack) return;

    const playAudio = async () => {
      if (audioElement.src !== currentTrack.fileUrl) {
        audioElement.src = currentTrack.fileUrl;
        audioElement.load();
        console.log("Loaded audio src:", currentTrack.fileUrl);
      }

      try {
        if (isPlaying) {
          await audioElement.play();
          console.log("Playing:", currentTrack.title);
        } else {
          audioElement.pause();
          console.log("Paused:", currentTrack.title);
        }
      } catch (error) {
        console.error("Playback error:", error);
      }
    };

    playAudio();

    const updateTime = () => dispatch(setCurrentTime(audioElement.currentTime || 0));
    const updateDuration = () => dispatch(setDuration(audioElement.duration || 0));
    const handleEnded = () => {
      if (isRepeating) {
        audioElement.currentTime = 0;
        audioElement.play();
        console.log("Repeating:", currentTrack.title);
      } else {
        handleSkipForward();
        console.log("Skipping forward from:", currentTrack.title);
      }
    };

    audioElement.addEventListener("timeupdate", updateTime);
    audioElement.addEventListener("loadedmetadata", updateDuration);
    audioElement.addEventListener("ended", handleEnded);
    audioElement.addEventListener("error", (e) => console.error("Audio error:", e));

    return () => {
      audioElement.removeEventListener("timeupdate", updateTime);
      audioElement.removeEventListener("loadedmetadata", updateDuration);
      audioElement.removeEventListener("ended", handleEnded);
      audioElement.removeEventListener("error", (e) => console.error("Audio error:", e));
    };
  }, [currentTrack, isPlaying, isRepeating, dispatch, handleSkipForward]);

  const handlePlay = (track: Track) => {
    console.log("Handle play called for:", track.title);
    baseHandlePlay(track);
  };

  const handleLike = async (trackId: string) => {
    const token = localStorage.getItem("token");
    if (!token || !trackId || !user?._id) return;
    const isCurrentlyLiked = likedSongs.has(trackId);
    try {
      const updatedUser = await toggleLike(user._id, trackId, token);
      dispatch(saveSignupData(updatedUser));
      setLikedSongs((prev) => {
        const newLiked = new Set(prev);
        if (isCurrentlyLiked) {
          newLiked.delete(trackId);
          toast.success("Removed from liked songs");
        } else {
          newLiked.add(trackId);
          toast.success("Added to liked songs");
        }
        return newLiked;
      });
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleAddToQueue = (track: Track) => {
    const queueEntry = {
      id: track._id || track.fileUrl,
      title: track.title,
      artists: track.artists,
      fileUrl: track.fileUrl,
      img: track.img,
    };
    const storedQueue = JSON.parse(localStorage.getItem("playQueue") || "[]");
    const updatedQueue = [...storedQueue, queueEntry].filter(
      (q, index, self) => index === self.findIndex((t) => t.id === q.id)
    );
    localStorage.setItem("playQueue", JSON.stringify(updatedQueue));
    toast.success(`Added ${track.title} to queue`);
  };

  const handleAddToPlaylist = async (trackId: string, playlistId: string) => {
    const token = localStorage.getItem("token");
    if (!token || !user?._id) {
      toast.error("Please log in to add to playlist");
      return;
    }
    try {
      await addTrackToPlaylist(user._id, playlistId, trackId, token);
      const playlist = playlists.find((p) => p._id === playlistId);
      if (!playlist) throw new Error("Playlist not found");
      toast.success(`Added to ${playlist.title}`);
      setDropdownTrackId(null);
    } catch (error: any) {
      console.error("Error adding to playlist:", error);
      toast.error(error?.response?.data?.message || "Failed to add to playlist");
    }
  };

  const handleDownload = async (fileUrl: string, title: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to download");
      return;
    }
    try {
      const response = await fetch(fileUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title}.flac`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded ${title}`);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download the track");
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <div className="flex-1 ml-64">
        <main className="container px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/explore")}
                className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition"
                title="Go back"
              >
                <ChevronLeft className="h-5 w-5 text-gray-400" />
              </button>
              <h1 className="text-3xl font-bold">{genreName || "Genre"}</h1>
            </div>
          </div>

          <section>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {tracks.length > 0 ? (
                tracks.map((track) => (
                  <Link
                    key={track._id}
                    to="#"
                    className="group bg-[#1d1d1d] rounded-lg p-4 hover:bg-[#242424] transition-colors flex flex-col"
                  >
                    <div className="w-full h-[200px] flex flex-col mb-3">
                      <div className="relative w-full h-[90%]">
                        <img
                          src={track.img || "/placeholder.svg"}
                          alt="Track Cover Top"
                          className="w-full h-full object-cover rounded-t-md"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-md pointer-events-none">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handlePlay(track);
                            }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-auto"
                          >
                            {currentTrack?.fileUrl === track.fileUrl && isPlaying ? (
                              <Pause size={24} className="text-white" />
                            ) : (
                              <Play size={24} className="text-white" />
                            )}
                          </button>
                        </div>
                      </div>
                      <img
                        src={track.img || "/placeholder.svg"}
                        alt="Track Cover Bottom"
                        className="w-full h-[10%] object-cover rounded-b-md blur-lg"
                      />
                    </div>
                    <div className="text-white font-semibold truncate">{track.title}</div>
                    <div className="text-gray-400 text-sm truncate">
                      {Array.isArray(track.artists) ? track.artists.join(", ") : track.artists}
                    </div>
                    {user?.premium !== "Free" && (
                      <div className="relative flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <button
                          className="p-1 hover:bg-[#333333] rounded-full text-white pointer-events-auto"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDropdownTrackId(dropdownTrackId === track._id ? null : track._id);
                          }}
                        >
                          <Plus size={16} />
                        </button>
                        {dropdownTrackId === track._id && (
                          <div className="absolute left-0 mt-8 w-48 bg-[#242424] rounded-md shadow-lg z-20 pointer-events-auto">
                            <ul className="py-1">
                              {playlists.length > 0 ? (
                                playlists.map((playlist) => (
                                  <li
                                    key={playlist._id}
                                    className="px-4 py-2 hover:bg-[#333333] cursor-pointer text-white"
                                    onClick={() => handleAddToPlaylist(track._id || track.fileUrl, playlist._id as string)}
                                  >
                                    {playlist.title}
                                  </li>
                                ))
                              ) : (
                                <li className="px-4 py-2 text-gray-400">No playlists available</li>
                              )}
                              <li
                                className="px-4 py-2 hover:bg-[#333333] cursor-pointer text-white border-t border-gray-700"
                                onClick={() => navigate(`/playlists/${user?._id}`)}
                              >
                                Create New Playlist
                              </li>
                            </ul>
                          </div>
                        )}
                        <button
                          className={`p-1 hover:bg-[#333333] rounded-full pointer-events-auto ${
                            likedSongs.has(track._id || track.fileUrl) ? "text-red-500" : "text-white"
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleLike(track._id || track.fileUrl);
                          }}
                        >
                          <Heart
                            size={16}
                            fill={likedSongs.has(track._id || track.fileUrl) ? "currentColor" : "none"}
                          />
                        </button>
                        <button
                          className="p-1 hover:bg-[#333333] rounded-full text-white pointer-events-auto"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDownload(track.fileUrl, track.title);
                          }}
                        >
                          <Download size={16} />
                        </button>
                        <button
                          className="p-1 hover:bg-[#333333] rounded-full text-white pointer-events-auto"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddToQueue(track);
                          }}
                        >
                          <ListMusic size={16} />
                        </button>
                      </div>
                    )}
                  </Link>
                ))
              ) : (
                <p className="text-white/70">No songs available in this genre</p>
              )}
            </div>
          </section>
        </main>

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
    </div>
  );
}