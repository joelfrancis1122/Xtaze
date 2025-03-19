"use client";

import { useState, useEffect } from "react";
import Sidebar from "./userComponents/SideBar";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PlayCircle, PauseCircle } from "lucide-react";
import { setCurrentTrack, setIsPlaying, toggleShuffle, toggleRepeat, setShuffleIndices, setCurrentShuffleIndex } from "../../redux/audioSlice";
import { Track } from "./types/ITrack";
import { fetchLikedSongs } from "../../services/userService";
import MusicPlayer from "./userComponents/TrackBar";
import { audio } from "../../utils/audio"; // Import global audio instance

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

export default function RecentSongsPage() {
  const [recentSongs, setRecentSongs] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentTrack, isPlaying, isShuffled, isRepeating, shuffleIndices, currentShuffleIndex } = useSelector((state: RootState) => state.audio);
  const user = useSelector((state: RootState) => state.user.signupData) as UserSignupData | null;

  // Fetch recent songs from localStorage and service
  useEffect(() => {
    const getRecentSongs = async () => {
      const token = localStorage.getItem("token");
      if (!token || !user?._id) {
        setRecentSongs([]);
        setLoading(false);
        toast.error("Please log in to see recent songs");
        navigate("/");
        return;
      }

      const storedSongs = JSON.parse(localStorage.getItem("recentSongs") || "[]");
      if (storedSongs.length === 0) {
        setRecentSongs([]);
        setLoading(false);
        return;
      }

      try {
        const sortedIds = storedSongs
          .sort((a: { playedAt: string }, b: { playedAt: string }) =>
            new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()
          )
          .map((s: { id: string }) => s.id);

        const tracks = await fetchLikedSongs(user._id, token, sortedIds);
        const orderedTracks = sortedIds
          .map((id: string) => tracks.find((track) => track._id === id || track.fileUrl === id))
          .filter((track:any): track is Track => !!track);
        setRecentSongs(orderedTracks);

        // Initialize shuffle indices if shuffled
        if (isShuffled && shuffleIndices.length === 0) {
          const indices = Array.from({ length: orderedTracks.length }, (_, i) => i);
          for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
          }
          dispatch(setShuffleIndices(indices));
          dispatch(setCurrentShuffleIndex(0));
        }
      } catch (error) {
        console.error("Error fetching recent songs:", error);
        toast.error("Failed to load recent songs");
      } finally {
        setLoading(false);
      }
    };

    getRecentSongs();
  }, [user?._id, navigate, dispatch, isShuffled]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user?._id) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handlePlay = (song: Track) => {
    if (currentTrack?.fileUrl === song.fileUrl) {
      if (isPlaying) {
        audio.pause();
        dispatch(setIsPlaying(false));
      } else {
        audio.play();
        dispatch(setIsPlaying(true));
      }
    } else {
      audio.src = song.fileUrl;
      audio.play();
      dispatch(setCurrentTrack(song));
      dispatch(setIsPlaying(true));
    }
  };

  const handleSkipBack = () => {
    if (!currentTrack || recentSongs.length === 0) return;

    let prevIndex: number;
    const currentIndex = recentSongs.findIndex((t) => t.fileUrl === currentTrack.fileUrl);

    if (isShuffled && shuffleIndices.length > 0) {
      const newShuffleIndex = currentShuffleIndex > 0 ? currentShuffleIndex - 1 : shuffleIndices.length - 1;
      prevIndex = shuffleIndices[newShuffleIndex];
      dispatch(setCurrentShuffleIndex(newShuffleIndex));
    } else {
      prevIndex = currentIndex > 0 ? currentIndex - 1 : recentSongs.length - 1;
    }

    const prevTrack = recentSongs[prevIndex];
    audio.src = prevTrack.fileUrl;
    audio.play();
    dispatch(setCurrentTrack(prevTrack));
    dispatch(setIsPlaying(true));
  };

  const handleSkipForward = () => {
    if (!currentTrack || recentSongs.length === 0) return;

    let nextIndex: number;
    const currentIndex = recentSongs.findIndex((t) => t.fileUrl === currentTrack.fileUrl);

    if (isShuffled && shuffleIndices.length > 0) {
      const newShuffleIndex = currentShuffleIndex < shuffleIndices.length - 1 ? currentShuffleIndex + 1 : 0;
      nextIndex = shuffleIndices[newShuffleIndex];
      dispatch(setCurrentShuffleIndex(newShuffleIndex));
    } else if (isRepeating && currentIndex === recentSongs.length - 1) {
      nextIndex = 0; // Loop to start if repeating
    } else {
      nextIndex = currentIndex < recentSongs.length - 1 ? currentIndex + 1 : 0;
    }

    const nextTrack = recentSongs[nextIndex];
    audio.src = nextTrack.fileUrl;
    audio.play();
    dispatch(setCurrentTrack(nextTrack));
    dispatch(setIsPlaying(true));
  };

  const handleToggleShuffle = () => {
    dispatch(toggleShuffle());
    if (!isShuffled && recentSongs.length > 0) {
      const indices = Array.from({ length: recentSongs.length }, (_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      dispatch(setShuffleIndices(indices));
      dispatch(setCurrentShuffleIndex(0));
    }
  };

  const handleToggleRepeat = () => {
    dispatch(toggleRepeat());
    audio.loop = isRepeating; // Sync audio.loop with Redux state
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar />
      <main className="flex-1 ml-[240px] py-16 px-10 pb-24">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex items-center justify-between">
            <h1 className="text-5xl font-bold">Recent Songs</h1>
            <p className="text-gray-400 text-base">{recentSongs.length} songs</p>
          </div>
          {loading ? (
            <div className="text-center py-4 text-gray-400">Loading recent songs...</div>
          ) : recentSongs.length > 0 ? (
            <div className="bg-[#151515] rounded-xl shadow-lg border border-black-900 overflow-hidden">
              <div className="grid grid-cols-[48px_2fr_1fr_1fr_48px] gap-4 px-6 py-4 text-gray-400 text-lg font-semibold border-b border-gray-700">
                <span className="text-center">#</span>
                <span>Title</span>
                <span>Artist</span>
                <span>Album</span>
                <span></span>
              </div>
              {recentSongs.map((song, index) => (
                <div
                  key={song._id || song.fileUrl}
                  className="grid grid-cols-[48px_2fr_1fr_1fr_48px] gap-4 px-6 py-4 hover:bg-[#212121] transition-all duration-200 cursor-pointer items-center group"
                >
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
                  <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {/* Add more actions here if desired */}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#1d1d1d] p-8 rounded-xl shadow-md border border-gray-800 text-center">
              <p className="text-gray-400 text-lg">No recent songs yet. Start listening to some tracks!</p>
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
            toggleModal={() => {} /* Add modal logic if needed */}
          />
        )}
      </main>
    </div>
  );
}