import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Play, Pause, Plus, Heart, Download, ListMusic } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import Sidebar from "./userComponents/SideBar";
import { fetchAllTrack, toggleLike, addTrackToPlaylist, getMyplaylist } from "../../services/userService";
import { Track } from "./types/ITrack";
import { setCurrentTrack, setIsPlaying, setCurrentTime, setDuration } from "../../redux/audioSlice";
import MusicPlayer from "./userComponents/TrackBar";
import PreviewModal from "./PreviewPage";
import { useAudioPlayback } from "./userComponents/audioPlayback";
import { audio } from "../../utils/audio";
import { toast } from "sonner";
import { Playlist } from "./types/IPlaylist";
import { UserSignupData } from "./types/IUser";
import { saveSignupData } from "../../redux/userSlice";

export default function ExplorePage() {
  const { currentTrack, isPlaying, isShuffled, isRepeating } = useSelector((state: RootState) => state.audio);
  const user = useSelector((state: RootState) => state.user.signupData) as UserSignupData | null;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [genres, setGenres] = useState<{ name: string; color: string }[]>([]);
  const [recentSongs, setRecentSongs] = useState<Track[]>([]);
  const [topCharts, setTopCharts] = useState<Track[]>([]); // Changed to just Track[] for current month
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set());
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [dropdownTrackId, setDropdownTrackId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const {
    handlePlay: baseHandlePlay,
    handleSkipBack,
    handleSkipForward,
    handleToggleShuffle,
    handleToggleRepeat,
  } = useAudioPlayback(tracks);

  const toggleModal = () => setIsModalOpen((prevState) => !prevState);

  const handlePlayFromModal = (track: Track) => {
    baseHandlePlay(track);
  };

  const handlePlay = (track: Track) => {
    console.log("Handle play called for:", track.title);
    if (currentTrack?.fileUrl === track.fileUrl && isPlaying) {
      audio.pause();
      dispatch(setIsPlaying(false));
    } else {
      dispatch(setCurrentTrack(track));
      dispatch(setIsPlaying(true));
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

  // Fetch data and calculate top charts for the current month
  useEffect(() => {
    const fetchData = async () => {
      try {
        const allTracks = await fetchAllTrack();
        console.log("All tracks:", allTracks);
        setTracks(allTracks);

        // Extract unique genres
        const uniqueGenres = Array.from(
          new Set(
            allTracks.flatMap((track) =>
              Array.isArray(track.genre)
                ? track.genre.flatMap((g) => g.split(/[,;]/).map((s: any) => s.trim()))
                : []
            )
          )
        );

        const genreColors = uniqueGenres.map((genre) => ({
          name: genre,
          color:
            genre === "Pop"
              ? "#ff69b4"
              : (() => {
                  let color;
                  do {
                    color = `#${Math.floor(Math.random() * 16777215).toString(16)}`.padEnd(7, "0");
                  } while (color === "#000000" || color === "#ffffff");
                  return color;
                })(),
        }));
        setGenres(genreColors);

        // Recent songs
        const sortedTracks = allTracks
          .filter((track) => track.createdAt && !isNaN(new Date(track.createdAt).getTime()))
          .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
        setRecentSongs(sortedTracks.slice(0, 6));

        // Calculate top charts for the current month
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`; // e.g., "2025-04"

        const monthlyPlays: { track: Track; plays: number }[] = [];
        allTracks.forEach((track) => {
          if (track.playHistory && Array.isArray(track.playHistory)) {
            const currentMonthHistory = track.playHistory.find((history) => history.month === currentMonth);
            if (currentMonthHistory) {
              monthlyPlays.push({ track, plays: currentMonthHistory.plays });
            }
          }
        });

        const topTracks = monthlyPlays
          .sort((a, b) => b.plays - a.plays) // Sort by plays descending
          .slice(0, 5) // Top 5 tracks
          .map((tp) => tp.track); // Extract track objects

        setTopCharts(topTracks);

        if (user?._id) {
          const fetchedPlaylists = await getMyplaylist(user._id);
          setPlaylists(fetchedPlaylists);
        }
      } catch (error) {
        console.error("Error fetching tracks:", error);
      }
    };

    fetchData();
  }, [user?._id]);

  // Sync likedSongs from user data
  useEffect(() => {
    if (user?.likedSongs) {
      setLikedSongs(new Set(user.likedSongs.map(String) || []));
    }
  }, [user?.likedSongs]);

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
        dispatch(setIsPlaying(false));
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

  return (
    <div className="flex min-h-screen bg-black text-white">
     <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
             {isSidebarOpen && (
               <div
                 className="fixed inset-0 bg-black/50 z-20 md:hidden"
                 onClick={() => setIsSidebarOpen(false)}
               ></div>
             )}
      <div className="flex-1 ml-64">
        <main className="container px-4 py-8">
          <section className="mb-10">
            <h1 className="text-3xl font-bold">Explore</h1>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold mt-15">Recent Songs</h2>
              <Link to="#" className="text-white/70 hover:text-white flex items-center gap-1">
                {/* See all <ChevronRight className="h-4 w-4" /> */}
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recentSongs.length > 0 ? (
                recentSongs.map((track) => (
                  <Link
                    key={track._id}
                    to="#"
                    className="group bg-[#1d1d1d] rounded-lg p-4 hover:bg-[#242424] transition-colors flex flex-col"
                  >
                    <div className="relative w-full h-[90%]">
                      <img
                        src={track.img || "/placeholder.svg"}
                        alt={track.title}
                        className="w-full h-full object-cover rounded-t-md transition-transform group-hover:scale-105"
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
                    <div className="pt-2">
                      <h3 className="font-medium text-sm truncate">{track.title}</h3>
                      <p className="text-xs text-white/70 truncate">
                        {Array.isArray(track.artists) ? track.artists.join(", ") : track.artists}
                      </p>
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
                <p className="text-white/70">No recent songs available</p>
              )}
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Browse by Genre</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {genres.length > 0 ? (
                genres.map((genre) => (
                  <div
                    key={genre.name}
                    onClick={() => navigate(`/genre/${genre.name}`)}
                    className="group cursor-pointer border-0 overflow-hidden rounded-md"
                    style={{ backgroundColor: genre.color }}
                  >
                    <div className="relative h-28 w-full p-4 flex items-start">
                      <h3 className="text-xl font-bold text-white">{genre.name}</h3>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-white/70">No genres available</p>
              )}
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Top Charts - This Month</h2>
            {topCharts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {topCharts.map((track) => (
                  <Link
                    key={track._id}
                    to="#"
                    className="group bg-[#1d1d1d] rounded-lg p-4 hover:bg-[#242424] transition-colors flex flex-col"
                  >
                    <div className="relative w-full h-[90%]">
                      <img
                        src={track.img || "/placeholder.svg"}
                        alt={track.title}
                        className="w-full h-full object-cover rounded-t-md transition-transform group-hover:scale-105"
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
                    <div className="pt-2">
                      <h3 className="font-medium text-sm truncate">{track.title}</h3>
                      <p className="text-xs text-white/70 truncate">
                        {Array.isArray(track.artists) ? track.artists.join(", ") : track.artists}
                      </p>
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
                ))}
              </div>
            ) : (
              <p className="text-white/70">No top charts available for this month</p>
            )}
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