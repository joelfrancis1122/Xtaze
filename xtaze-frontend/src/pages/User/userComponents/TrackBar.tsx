
import { useState, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Clock } from "lucide-react";
import type { Track } from "../types/ITrack";
import { useSelector, useDispatch } from "react-redux";
import { setIsPlaying, setCurrentTime, setDuration, setVolume } from "../../../redux/audioSlice";
import { RootState } from "../../../store/store";

interface MusicPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  handlePlay: (track: Track) => void;
  handleSkipBack: () => void;
  handleSkipForward: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  isShuffled: boolean;
  isRepeating: boolean;
  audio: HTMLAudioElement;
  toggleModal: () => void;
}

const formatTime = (time: number): string => {
  if (!time || isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const updateRecentSongs = (track: Track) => {
  const trackId = track.id || track.fileUrl;
  const recentSongs = JSON.parse(localStorage.getItem("recentSongs") || "[]");
  const newEntry = { id: trackId, playedAt: new Date().toISOString() };
  const updatedSongs = [newEntry, ...recentSongs.filter((s: any) => s.id !== trackId)].slice(0, 20);
  localStorage.setItem("recentSongs", JSON.stringify(updatedSongs));
};

export default function MusicPlayer({
  currentTrack,
  isPlaying,
  handlePlay,
  handleSkipBack,
  handleSkipForward,
  toggleShuffle,
  toggleRepeat,
  isShuffled,
  isRepeating,
  audio,
  toggleModal,
}: MusicPlayerProps) {
  const dispatch = useDispatch();
  const { currentTime: reduxCurrentTime, duration: reduxDuration, volume: reduxVolume } = useSelector(
    (state: RootState) => state.audio
  );
  const [localCurrentTime, setLocalCurrentTime] = useState(reduxCurrentTime);
  const [localDuration, setLocalDuration] = useState(reduxDuration);
  const [localVolume, setLocalVolume] = useState(reduxVolume);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const [isSleepDropdownOpen, setIsSleepDropdownOpen] = useState(false);

  const sleepOptions = [1, 5, 10, 15, 20, 30, 45, 60];

  const handleSleepTimer = (minutes: number | null) => {
    if (timerId) {
      clearTimeout(timerId);
      setTimerId(null);
    }
    if (minutes === null) {
      setSleepTimer(null);
    } else {
      setSleepTimer(minutes);
      const milliseconds = minutes * 60 * 1000;
      const id = setTimeout(() => {
        audio.pause();
        dispatch(setIsPlaying(false));
        setSleepTimer(null);
        setTimerId(null);
      }, milliseconds);
      setTimerId(id);
    }
    setIsSleepDropdownOpen(false);
  };

  useEffect(() => {
    if (currentTrack) {
      if (!audio.src) {
        audio.src = currentTrack.fileUrl;
        audio.currentTime = reduxCurrentTime;
        audio.volume = reduxVolume;
      }
      if (isPlaying && audio.paused) {
        audio.play();
        updateRecentSongs(currentTrack);
      }
      if (audio.paused && isPlaying) {
        dispatch(setIsPlaying(false));
      } else if (!audio.paused && !isPlaying) {
        dispatch(setIsPlaying(true));
      }
    }
  }, [currentTrack, isPlaying, reduxCurrentTime, reduxVolume, audio, dispatch]);

  useEffect(() => {
    const handleTimeUpdate = () => {
      setLocalCurrentTime(audio.currentTime);
      dispatch(setCurrentTime(audio.currentTime));
    };
    const handleLoadedMetadata = () => {
      setLocalDuration(audio.duration);
      dispatch(setDuration(audio.duration));
    };
    const handlePlayEvent = () => {
      dispatch(setIsPlaying(true));
      if (currentTrack) updateRecentSongs(currentTrack);
    };
    const handlePauseEvent = () => dispatch(setIsPlaying(false));

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("play", handlePlayEvent);
    audio.addEventListener("pause", handlePauseEvent);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("play", handlePlayEvent);
      audio.removeEventListener("pause", handlePauseEvent);
    };
  }, [audio, dispatch, currentTrack]);

  const handleVolumeChange = (value: number) => {
    setLocalVolume(value);
    audio.volume = value;
    dispatch(setVolume(value));
  };

  const toggleSleepDropdown = () => {
    setIsSleepDropdownOpen((prev) => !prev);
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#121212] py-2 sm:py-3 px-4 flex flex-col sm:flex-row items-center justify-between z-50 border-t border-gray-800 shadow-lg">
      <div
        className="absolute top-0 left-0 right-0 h-1 bg-[#121212] filter blur-3xl"
        style={{ backgroundImage: `linear-gradient(to bottom, rgba(18, 18, 18, 0.9), transparent)` }}
      />
      {/* Track Info */}
      <div className="flex items-center w-full sm:w-1/4 min-w-0 relative z-10 mb-2 sm:mb-0">
        <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleModal(); }}>
          <img src={currentTrack.img || "/default-track.jpg"} alt="Track Cover" className="w-full h-full object-cover rounded-md shadow-md" />
        </div>
        <div className="ml-3 overflow-hidden min-w-0">
          <p className="text-xs sm:text-sm font-semibold text-white truncate">{currentTrack.title}</p>
          <p className="text-[11px] sm:text-xs text-gray-400 truncate">
            {Array.isArray(currentTrack.artists) ? currentTrack.artists.join(", ") : currentTrack.artists}
          </p>
        </div>
      </div>
      {/* Playback Controls */}
      <div className="flex flex-col items-center gap-2 w-full sm:w-96 z-10">
        <div className="flex items-center gap-4 justify-center">
          <button
            onClick={toggleShuffle}
            className={`p-1 rounded-full hover:bg-[#242424] transition-colors ${isShuffled ? "text-red-500" : "text-gray-300"}`}
          >
            <Shuffle size={18} />
          </button>
          <button
            onClick={handleSkipBack}
            className="p-1 rounded-full hover:bg-[#242424] text-gray-300 transition-colors"
          >
            <SkipBack size={20} />
          </button>
          <button
            onClick={() => handlePlay(currentTrack)}
            className="p-2 bg-[#1d1d1d] rounded-full hover:bg-[#242424] transition-colors shadow-md"
          >
            {isPlaying ? <Pause size={24} className="text-white" /> : <Play size={24} className="text-white" />}
          </button>
          <button
            onClick={handleSkipForward}
            className="p-1 rounded-full hover:bg-[#242424] text-gray-300 transition-colors"
          >
            <SkipForward size={20} />
          </button>
          <button
            onClick={toggleRepeat}
            className={`p-1 rounded-full hover:bg-[#242424] transition-colors ${isRepeating ? "text-red-500" : "text-gray-300"}`}
          >
            <Repeat size={18} />
          </button>
        </div>
        <div className="flex items-center gap-2 w-full">
          <span className="text-xs text-gray-400 w-[30px] text-right">{formatTime(localCurrentTime)}</span>
          <input
            type="range"
            min="0"
            max={localDuration || 0}
            value={localCurrentTime || 0}
            step="0.02"
            className="w-full h-1 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md"
            onChange={(e) => {
              const newTime = Number.parseFloat(e.target.value);
              audio.currentTime = newTime;
              setLocalCurrentTime(newTime);
              dispatch(setCurrentTime(newTime));
            }}
          />
          <span className="text-xs text-gray-400 w-[30px]">{formatTime(localDuration)}</span>
        </div>
      </div>
      {/* Volume Control and Sleep Timer */}
      <div className="hidden sm:flex items-center gap-4 w-full sm:w-1/4 justify-end mt-2 sm:mt-0 z-10">
        <div className="relative">
          <button
            className="flex items-center gap-1 p-1 rounded-full hover:bg-[#242424] text-gray-300 transition-colors"
            onClick={toggleSleepDropdown}
          >
            <Clock size={18} />
            <span className="text-xs">{sleepTimer ? ` ${sleepTimer}m` : ""}</span>
          </button>
          {isSleepDropdownOpen && (
            <div className="absolute right-0 bottom-10 bg-[#1d1d1d] rounded-md shadow-lg border border-gray-800 w-30">
              <ul className="py-1">
                <li
                  className="px-4 py-2 text-sm text-gray-300 hover:bg-[#242424] cursor-pointer"
                  onClick={() => handleSleepTimer(null)}
                >
                  Off
                </li>
                {sleepOptions.map((minutes) => (
                  <li
                    key={minutes}
                    className="px-4 py-2 text-sm text-gray-300 hover:bg-[#242424] cursor-pointer"
                    onClick={() => handleSleepTimer(minutes)}
                  >
                    {minutes} min
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Volume2 size={18} className="text-gray-300" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={localVolume}
            className="w-24 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md"
            onChange={(e) => handleVolumeChange(Number.parseFloat(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}