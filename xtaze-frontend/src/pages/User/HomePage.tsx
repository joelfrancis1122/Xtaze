import { useEffect, useState } from "react";
import Sidebar from "./userComponents/SideBar";
import MusicPlayer from "./userComponents/TrackBar";
import PreviewModal from "./PreviewPage";
import { WavyBackground } from "../../components/ui/wavy-background";
import type { Track } from "./types/ITrack";
import { useDispatch, useSelector } from "react-redux";
import { clearSignupData, saveSignupData } from "../../redux/userSlice";
import { clearAudioState } from "../../redux/audioSlice";
import { RootState } from "../../store/store";
import { useNavigate } from "react-router-dom";
import { audio, audioContext, updateEqualizer } from "../../utils/audio";
import { PlaceholdersAndVanishInput } from "../../utils/placeholders-and-vanish-input";
import { Search, Power, Play, Pause, Plus, Heart, Download, ListMusic, Menu } from "lucide-react";
import { fetchTracks, fetchLikedSongs, incrementListeners, toggleLike, getMyplaylist, addTrackToPlaylist, fetchBanners } from "../../services/userService";
import { toast } from "sonner";
import { IBanner } from "./types/IBanner";
import { useAudioPlayback } from "./userComponents/audioPlayback";
import { UserSignupData } from "./types/IUser";
import { QueueTrack } from "./types/IQueue";
import { Playlist } from "./types/IPlaylist";

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playedSongs, setPlayedSongs] = useState<Set<string>>(new Set());
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set());
  const [randomIndex, setRandomIndex] = useState<number | null>(null);
  const [dropdownTrackId, setDropdownTrackId] = useState<string | null>(null);
  const [banners, setBanners] = useState<IBanner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchQuerysaved, setSearchQuerysaved] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State to toggle sidebar

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.user.signupData) as UserSignupData | null;
  const { currentTrack, isPlaying, isShuffled, isRepeating } = useSelector((state: RootState) => state.audio);

  const { handlePlay: baseHandlePlay, handleSkipBack, handleSkipForward, handleToggleShuffle, handleToggleRepeat } =
    useAudioPlayback(tracks);

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

  useEffect(() => {
    if (user?.likedSongs) {
      setLikedSongs(new Set(user.likedSongs.map(String) || []));
    }
  }, [user?.likedSongs]);

  useEffect(() => {
    const getTracksAndLikedSongsAndPlaylists = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found or invalid role. Please login.");
        setLoading(false);
        return;
      }

      try {
        const { tracks: fetchedTracks, user: updatedUser } = await fetchTracks(
          user?._id || "",
          token,
          user?.premium || "Free"
        );
        setTracks(fetchedTracks);

        if (updatedUser && JSON.stringify(updatedUser) !== JSON.stringify(user)) {
          dispatch(saveSignupData(updatedUser));
        }

        if (user?.likedSongs && user.likedSongs.length > 0) {
          const liked = await fetchLikedSongs(user._id || "", token, user.likedSongs);
          setLikedTracks(liked);
        } else {
          setLikedTracks([]);
        }
        console.log(likedSongs, likedTracks);
        const fetchedPlaylists = await getMyplaylist((user?._id) as string);
        setPlaylists(fetchedPlaylists);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    getTracksAndLikedSongsAndPlaylists();
  }, [dispatch, user?._id, user?.premium]);

  // Random index for featured track
  useEffect(() => {
    if (user?.premium !== "Free" && tracks.length > 0 && randomIndex === null) {
      setRandomIndex(Math.floor(Math.random() * tracks.length));
    } else if (user?.premium === "Free" || tracks.length === 0) {
      setRandomIndex(null);
    }
  }, [user?.premium, tracks.length]);

  // Load banners
  useEffect(() => {
    const loadBanners = async () => {
      try {
        const allBanners = await fetchBanners();
        setBanners(allBanners);
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    };
    loadBanners();
  }, []);

  // Auto-slide banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handleIncrementListeners = async (trackId: string) => {
    const token = localStorage.getItem("token");
    if (!token || !trackId || !user?._id) return;

    try {
      await incrementListeners(trackId, token, user._id);

      setTracks((prevTracks) =>
        prevTracks.map((track) =>
          track._id === trackId
            ? {
                ...track,
                listeners: [...(track.listeners || []), user._id].filter(Boolean) as string[],
              }
            : track
        )
      );
    } catch (error) {
      console.error("Error incrementing listeners:", error);
    }
  };

  const handlePlay = (track: Track) => {
    baseHandlePlay(track);
    if (currentTrack?.fileUrl !== track.fileUrl && !playedSongs.has(track._id || track.fileUrl)) {
      handleIncrementListeners(track._id || track.fileUrl);
      setPlayedSongs((prev) => new Set(prev).add(track._id || track.fileUrl));
    }
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

  const handleAddToQueue = (track: Track) => {
    const queueEntry: QueueTrack = {
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

  const toggleModal = () => {
    setIsModalOpen((prevState) => !prevState);
  };

  const handleClick = () => {
    audio.pause();
    audio.src = "";
    localStorage.removeItem("token");
    dispatch(clearSignupData());
    dispatch(clearAudioState());
    navigate("/", { replace: true });
  };

  const placeholders = ["Cout me out?", "What's the first rule of Fight Club?", "Send me an angel"];
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchQuerysaved(searchQuery);
    console.log("Search submitted:", searchQuery);
  };

  const handleUpgradeClick = () => {
    navigate("/plans");
  };

  const handleDownload = async (fileUrl: string, title: string) => {
    if (!fileUrl || !title) {
      console.error("Invalid file URL or title");
      toast.error("Cannot download: Invalid file details");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      toast.error("Please log in to download");
      return;
    }

    try {
      const response = await fetch(fileUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title}.flac`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setDropdownTrackId(null);
      toast.success(`Downloaded ${title}`);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download the track");
    }
  };

  // Handle play from PreviewModal
  const handlePlayFromModal = (track: Track) => {
    handlePlay(track);
  };

  // Filter tracks based on search query
  const filteredTracks = tracks.filter((track) => {
    const query = searchQuerysaved.toLowerCase();
    const titleMatch = track.title.toLowerCase().includes(query);
    const artistMatch = Array.isArray(track.artists)
      ? track.artists.some((artist) => artist.toLowerCase().includes(query))
      : track.artists.toLowerCase().includes(query);
    return titleMatch || artistMatch;
  });

  // Split filtered tracks into newArrivals and otherSongs
  const newArrivals = filteredTracks.slice(0, 5);
  const otherSongs = filteredTracks.slice(5);

  return (
    <div className="flex h-screen flex-col bg-black text-white">
      <div className="flex flex-1 relative">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}
        <main
          className={`flex-1 min-h-screen bg-black overflow-y-auto transition-all duration-300 ${
            isSidebarOpen ? "ml-64" : "ml-0"
          } md:ml-[256px]`} // Dynamic margin on mobile, fixed on desktop
        >
          <header className="flex justify-between items-center p-4 sticky top-0 bg-black z-10">
            {/* Hamburger menu for mobile */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-white p-2 hover:bg-[#242424] rounded-full md:hidden"
            >
              <Menu size={24} />
            </button>
            <div className="relative flex-1 mx-4">
              <Search className="absolute left-78 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={20} />
              <PlaceholdersAndVanishInput placeholders={placeholders} onChange={handleChange} onSubmit={onSubmit} />
            </div>
            <button className="p-2 hover:bg-[#242424] rounded-full" onClick={handleClick}>
              <Power size={20} />
            </button>
          </header>

          <section className="px-6 py-4 pb-25">
            {/* Carousel Banner */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-4">Enjoy Hi-Res Songs</h2>
              <div className="relative w-full h-[300px] rounded-lg overflow-hidden shadow-lg">
                <div className="w-full h-full overflow-hidden">
                  <div
                    className="flex transition-transform duration-500 ease-in-out w-full"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                  >
                    {banners.map((banner) => (
                      <div
                        key={banner._id}
                        className="min-w-full w-full flex-shrink-0 relative cursor-pointer"
                      >
                        <img
                          src={banner.imageUrl}
                          alt={banner.title}
                          className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent shadow-inner z-10 pointer-events-none" />
                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                          <button className="p-4 bg-black/50 rounded-full hover:bg-black/70 transition-colors pointer-events-auto">
                            <Play size={32} className="text-white" />
                          </button>
                        </div>
                        <div className="absolute bottom-40 left-4 z-20">
                          <h3 className="text-2xl font-bold text-white shadow-text">{banner.title}</h3>
                          <p className="text-gray-300 shadow-text">{banner.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {banners.length > 1 && (
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 z-20">
                    {banners.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentIndex(index);
                        }}
                        className={`w-2 h-2 rounded-full ${index === currentIndex ? "bg-white" : "bg-gray-500"}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* New Arrivals Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">New Arrivals</h2>
              {loading ? (
                <div className="text-center py-4">Loading tracks...</div>
              ) : newArrivals.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {newArrivals.map((track, index) => (
                    <div
                      key={index}
                      className="group bg-[#1d1d1d] rounded-lg p-4 hover:bg-[#242424] transition-colors flex flex-col"
                    >
                      <div className="w-full h-[200px] flex flex-col mb-3">
                        <div className="relative w-full h-[90%]">
                          <img
                            src={track.img || "/placeholder.svg"}
                            alt="Track Cover Top"
                            className="w-full h-full object-cover rounded-t-md"
                          />
                          <button
                            onClick={() => handlePlay(track)}
                            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-10 rounded-t-md"
                          >
                            {currentTrack?.fileUrl === track.fileUrl && isPlaying ? (
                              <Pause size={24} className="text-white" />
                            ) : (
                              <Play size={24} className="text-white" />
                            )}
                          </button>
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
                        <div className="relative flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="p-1 hover:bg-[#333333] rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDropdownTrackId(dropdownTrackId === track._id ? null : track._id);
                            }}
                          >
                            <Plus size={16} />
                          </button>
                          {dropdownTrackId === track._id && (
                            <div className="absolute left-0 mt-8 w-48 bg-[#242424] rounded-md shadow-lg z-20">
                              <ul className="py-1">
                                {playlists.length > 0 ? (
                                  playlists.map((playlist) => (
                                    <li
                                      key={playlist._id}
                                      className="px-4 py-2 hover:bg-[#333333] cursor-pointer text-white"
                                      onClick={() =>
                                        handleAddToPlaylist(track._id || track.fileUrl, playlist._id as string)
                                      }
                                    >
                                      {playlist.title}
                                    </li>
                                  ))
                                ) : (
                                  <li className="px-4 py-2 text-gray-400">No playlists available</li>
                                )}
                            
                              </ul>
                            </div>
                          )}
                          <button
                            onClick={() => handleLike(track._id || track.fileUrl)}
                            className={`p-1 hover:bg-[#333333] rounded-full ${likedSongs.has(track._id || track.fileUrl) ? "text-red-500" : "text-white"}`}
                          >
                            <Heart
                              size={16}
                              fill={likedSongs.has(track._id || track.fileUrl) ? "currentColor" : "none"}
                            />
                          </button>
                          <button
                            className="p-1 hover:bg-[#333333] rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(track.fileUrl, track.title);
                            }}
                          >
                            <Download size={16} />
                          </button>
                          <button
                            className="p-1 hover:bg-[#333333] rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToQueue(track);
                            }}
                          >
                            <ListMusic size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400">
                  No new arrivals match your search "{searchQuerysaved}"
                </div>
              )}
            </div>

            {/* Featured Today / Enhance Experience */}
            <div className="mb-8">
              {user?.premium !== "Free" && randomIndex !== null ? (
                <>
                  <h2 className="text-3xl font-bold mb-4 font-sans">Featured Today</h2>
                  <div
                    className="relative w-full h-[300px] bg-[#1d1d1d] rounded-lg overflow-hidden cursor-pointer shadow-lg"
                    onClick={() => tracks[randomIndex] && handlePlay(tracks[randomIndex])}
                  >
                    <img
                      src={tracks[randomIndex]?.img}
                      alt="Featured Banner"
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent shadow-inner z-10 pointer-events-none" />
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <button className="p-4 bg-black/50 rounded-full hover:bg-black/70 transition-colors">
                        <Play size={32} className="text-white" />
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-4 z-20">
                      <h3 className="text-2xl font-bold text-white shadow-text">
                        {tracks[randomIndex]?.title || "Featured Track"}
                      </h3>
                      <p className="text-gray-300 shadow-text">
                        {Array.isArray(tracks[randomIndex]?.artists)
                          ? tracks[randomIndex]?.artists.join(", ")
                          : tracks[randomIndex]?.artists || "Various Artists"}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold mb-4">Enhance Your Experience</h2>
                  <div
                    className="relative w-full h-[300px] bg-[#000000] rounded-lg shadow-lg cursor-pointer overflow-hidden"
                    onClick={handleUpgradeClick}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent shadow-inner z-10 pointer-events-none" />
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <div className="overflow-visible w-full h-full flex items-center justify-center">
                        <WavyBackground
                          className="w-full h-[400px] flex flex-col items-center justify-center"
                          style={{ transform: "translateY(-50px)" }}
                        >
                          <p className="text-2xl md:text-4xl lg:text-7xl text-white font-bold inter-var text-center">
                            Listen. Discover. Repeat
                          </p>
                          <p className="text-base md:text-lg mt-4 text-white font-normal inter-var text-center">
                            Hear your music in the best-in-class sound.
                          </p>
                        </WavyBackground>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Explore More Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Explore More</h2>
              {loading ? (
                <div className="text-center py-4">Loading tracks...</div>
              ) : otherSongs.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {otherSongs.map((track, index) => (
                    <div
                      key={index}
                      className="group bg-[#1d1d1d] rounded-lg p-4 hover:bg-[#242424] transition-colors flex flex-col"
                    >
                      <div className="w-full h-[200px] flex flex-col mb-3">
                        <div className="relative w-full h-[90%]">
                          <img
                            src={track.img || "/placeholder.svg"}
                            alt="Track Cover Top"
                            className="w-full h-full object-cover rounded-t-md"
                          />
                          <button
                            onClick={() => handlePlay(track)}
                            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-10 rounded-t-md"
                          >
                            {currentTrack?.fileUrl === track.fileUrl && isPlaying ? (
                              <Pause size={24} className="text-white" />
                            ) : (
                              <Play size={24} className="text-white" />
                            )}
                          </button>
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
                        <div className="relative flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="p-1 hover:bg-[#333333] rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDropdownTrackId(dropdownTrackId === track._id ? null : track._id);
                            }}
                          >
                            <Plus size={16} />
                          </button>
                          {dropdownTrackId === track._id && (
                            <div className="absolute left-0 mt-8 w-48 bg-[#242424] rounded-md shadow-lg z-20">
                              <ul className="py-1">
                                {playlists.length > 0 ? (
                                  playlists.map((playlist) => (
                                    <li
                                      key={playlist._id}
                                      className="px-4 py-2 hover:bg-[#333333] cursor-pointer text-white"
                                      onClick={() =>
                                        handleAddToPlaylist(track._id || track.fileUrl, playlist._id as string)
                                      }
                                    >
                                      {playlist.title}
                                    </li>
                                  ))
                                ) : (
                                  <li className="px-4 py-2 text-gray-400">No playlists available</li>
                                )}
                                {/* <li
                                  className="px-4 py-2 hover:bg-[#333333] cursor-pointer text-white border-t border-gray-700"
                                  onClick={() => navigate(`/playlists/${user?._id}`)}
                                >
                                  Create New Playlist
                                </li> */}
                              </ul>
                            </div>
                          )}
                          <button
                            onClick={() => handleLike(track._id || track.fileUrl)}
                            className={`p-1 hover:bg-[#333333] rounded-full ${likedSongs.has(track._id || track.fileUrl) ? "text-red-500" : "text-white"}`}
                          >
                            <Heart
                              size={16}
                              fill={likedSongs.has(track._id || track.fileUrl) ? "currentColor" : "none"}
                            />
                          </button>
                          <button
                            className="p-1 hover:bg-[#333333] rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(track.fileUrl, track.title);
                            }}
                          >
                            <Download size={16} />
                          </button>
                          <button
                            className="p-1 hover:bg-[#333333] rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToQueue(track);
                            }}
                          >
                            <ListMusic size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400">
                  No additional tracks match your search "{searchQuerysaved}"
                </div>
              )}
            </div>
          </section>
        </main>
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
  );
}