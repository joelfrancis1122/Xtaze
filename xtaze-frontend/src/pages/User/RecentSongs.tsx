import { useState, useEffect } from "react";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PlayCircle, PauseCircle } from "lucide-react";
import { setShuffleIndices, setCurrentShuffleIndex } from "../../redux/audioSlice";
import { Track } from "./types/ITrack";
import { fetchTracks } from "../../services/userService";
import MusicPlayer from "./userComponents/TrackBar";
import { audio } from "../../utils/audio";
import { UserSignupData } from "./types/IUser";
import { useAudioPlayback } from "./userComponents/audioPlayback";
import SidebarX from "./userComponents/Sidebr";

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
  const { currentTrack, isPlaying, isShuffled, isRepeating, shuffleIndices } = useSelector((state: RootState) => state.audio);
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
      if (!token || !user?.id) {
        setRecentSongs([]);
        setTracks([]);
        setLoading(false);
        toast.error("Please log in to see recent songs");
        navigate("/");
        return;
      }

      const storedSongs: RecentSongItem[] = JSON.parse(localStorage.getItem("recentSongs") || "[]");
      
      if (storedSongs.length === 0) {
        setRecentSongs([]);
        setTracks([]);
        setLoading(false);
        return;
      }

      try {
        const { tracks } = await fetchTracks(user.id, user.premium || "Free");

        const sortedRecentSongs = [...storedSongs].sort((a, b) => 
          new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()
        );

        const recentTracks = sortedRecentSongs
          .map(recentSong => {
            const matchedTrack = tracks.find(track => 
              track.id === recentSong.id || track.fileUrl === recentSong.id
            );
            if (matchedTrack) {
              return {
                ...matchedTrack,
                playedAt: recentSong.playedAt,
              };
            }
            return null;
          })
          .filter((track): track is Track & { playedAt: string } => track !== null);

        setRecentSongs(recentTracks);

        const tracksForPlayback = recentTracks.map(({ playedAt, ...track }) => track);
        setTracks(tracksForPlayback);

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
        setRecentSongs([]);
        setTracks([]);
      } finally {
        setLoading(false);
      }
    };

    getRecentSongs();
  }, [user?.id, user?.premium, navigate, dispatch, isShuffled, shuffleIndices.length]);

  useEffect(() => {
    if (!user?.id) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const formatPlayedDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-black text-white flex px-1">
  <SidebarX>

      <main className="flex-1 px-4 sm:px-10 py-8 sm:py-16 pb-20">
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
          <span className="text-white">Recent Songs</span>
        </nav>
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-3xl sm:text-5xl font-bold">Recent Songs</h1>
            <p className="text-gray-400 text-sm sm:text-base">{recentSongs.length} songs</p>
          </div>
          {loading ? (
            <div className="text-center py-3 sm:py-4 text-sm sm:text-base text-gray-400">
              Loading recent songs...
            </div>
          ) : recentSongs.length > 0 ? (
            <div className="bg-[#151515] rounded-xl shadow-lg border border-black-900 overflow-hidden">
              <div className="grid grid-cols-[48px_3fr_2fr_48px] sm:grid-cols-[48px_2fr_1fr_1fr_1fr_48px] gap-2 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 text-gray-400 text-xs sm:text-base font-semibold border-b border-gray-700">
                <span className="text-center">#</span>
                <span>Title</span>
                <span>Artist</span>
                <span className="hidden sm:block">Album</span>
                <span className="hidden sm:block">Played</span>
                <span></span>
              </div>
              {recentSongs.map((song, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[48px_3fr_2fr_48px] sm:grid-cols-[48px_2fr_1fr_1fr_1fr_48px] gap-2 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-[#212121] active:bg-[#212121] transition-colors duration-200 cursor-pointer items-center group"
                >
                  <span className="text-gray-400 text-base sm:text-lg text-center">
                    {index + 1}
                  </span>
                  <div className="flex items-center space-x-2 sm:space-x-4 truncate">
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-md overflow-hidden flex-shrink-0">
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
                        className="absolute inset-0 flex items-center justify-center bg-black/70 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity duration-200 rounded-md"
                      >
                        {currentTrack?.fileUrl === song.fileUrl && isPlaying ? (
                          <PauseCircle size={20} className="text-white sm:size-24" />
                        ) : (
                          <PlayCircle size={20} className="text-white sm:size-24" />
                        )}
                      </button>
                    </div>
                    <div className="truncate">
                      <h3 className="text-white font-medium text-base sm:text-lg truncate">
                        {song.title}
                      </h3>
                    </div>
                  </div>
                  <span className="text-gray-400 text-sm sm:text-lg truncate">
                    {Array.isArray(song.artists) ? song.artists.join(", ") : song.artists}
                  </span>
                  <span className="hidden sm:block text-gray-400 text-sm sm:text-lg truncate">
                    {song.album}
                  </span>
                  <span className="hidden sm:block text-gray-400 text-sm sm:text-lg truncate">
                    {formatPlayedDate((song as any).playedAt)}
                  </span>
                  <div className="flex items-center justify-end md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity duration-200">
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#1d1d1d] p-6 sm:p-8 rounded-xl shadow-md border border-gray-800 text-center">
              <p className="text-gray-400 text-sm sm:text-lg">
                No recent songs yet. Start listening to some tracks!
              </p>
            </div>
          )}
        </div>
        </main>
  </SidebarX>

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
    </div>
  );
}