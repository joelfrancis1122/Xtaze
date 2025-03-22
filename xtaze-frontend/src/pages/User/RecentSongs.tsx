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
import { fetchTracks } from "../../services/userService";
import MusicPlayer from "./userComponents/TrackBar";
import { audio } from "../../utils/audio";
import { UserSignupData } from "./types/IUser";
import { useAudioPlayback } from "./userComponents/audioPlayback";


interface RecentSongItem {
  id: string;
  playedAt: string;
}

export default function RecentSongsPage() {
  const [recentSongs, setRecentSongs] = useState<Track[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentTrack, isPlaying, isShuffled, isRepeating, shuffleIndices, currentShuffleIndex } = useSelector((state: RootState) => state.audio);
  const user = useSelector((state: RootState) => state.user.signupData) as UserSignupData | null;


    const {
      handlePlay: baseHandlePlay,
      handleSkipBack,
      handleSkipForward,
      handleToggleShuffle,
      handleToggleRepeat,
    } = useAudioPlayback(tracks);
  


  useEffect(() => {
    const getRecentSongs = async () => {
      const token = localStorage.getItem("token");
      if (!token || !user?._id) {
        console.log("No token or user ID:", { token, userId: user?._id });
        setRecentSongs([]);
        setLoading(false);
        toast.error("Please log in to see recent songs");
        navigate("/");
        return;
      }

      // Get recent song IDs from localStorage
      const storedSongs: RecentSongItem[] = JSON.parse(localStorage.getItem("recentSongs") || "[]");
      console.log("Stored recent songs:", storedSongs);
      
      if (storedSongs.length === 0) {
        setRecentSongs([]);
        setLoading(false);
        return;
      }

      try {
        // Get all tracks to cross reference with recent song IDs
        const { tracks } = await fetchTracks(user._id, token, user.premium || false);
        console.log("All tracks fetched:", tracks);

        // Sort recent songs by playedAt time (newest first)
        const sortedRecentSongs = [...storedSongs].sort((a, b) => 
          new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()
        );

        // Map recent song IDs to full track objects
        const recentTracks = sortedRecentSongs
          .map(recentSong => {
            const matchedTrack = tracks.find(track => 
              track._id === recentSong.id || track.fileUrl === recentSong.id
            );
            
            if (matchedTrack) {
              // Add playedAt info to the track for reference
              return {
                ...matchedTrack,
                playedAt: recentSong.playedAt
              };
            }
            return null;
          })
          .filter((track): track is Track & { playedAt: string } => track !== null);

        console.log("Mapped recent tracks:", recentTracks);
        setRecentSongs(recentTracks);

        // Initialize shuffle indices if needed
        if (isShuffled && shuffleIndices.length === 0 && recentTracks.length > 0) {
          const indices = Array.from({ length: recentTracks.length }, (_, i) => i);
          for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
          }
          dispatch(setShuffleIndices(indices));
          dispatch(setCurrentShuffleIndex(0));
        }
      } catch (error) {
        console.error("Error fetching track details for recent songs:", error);
        toast.error("Failed to load recent songs details");
      } finally {
        setLoading(false);
      }
    };

    getRecentSongs();
  }, [user?._id, user?.premium, navigate, dispatch, isShuffled, shuffleIndices.length]);

  useEffect(() => {
    if (!user?._id) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);



 

 


  // Format timestamp to a readable date
  const formatPlayedDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    });
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
              <div className="grid grid-cols-[48px_2fr_1fr_1fr_1fr_48px] gap-4 px-6 py-4 text-gray-400 text-lg font-semibold border-b border-gray-700">
                <span className="text-center">#</span>
                <span>Title</span>
                <span>Artist</span>
                <span>Album</span>
                <span>Played</span>
                <span></span>
              </div>
              {recentSongs.map((song, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[48px_2fr_1fr_1fr_1fr_48px] gap-4 px-6 py-4 hover:bg-[#212121] transition-all duration-200 cursor-pointer items-center group"
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
                          baseHandlePlay(song);
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
                  <span className="text-gray-400 text-lg truncate">
                    {formatPlayedDate((song as any).playedAt)}
                  </span>
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
            handlePlay={baseHandlePlay}
            handleSkipBack={handleSkipBack}
            handleSkipForward={handleSkipForward}
            toggleShuffle={handleToggleShuffle}
            toggleRepeat={handleToggleRepeat}
            isShuffled={isShuffled}
            isRepeating={isRepeating}
            audio={audio}
            toggleModal={() => {}}
          />
        )}
      </main>
    </div>
  );
}