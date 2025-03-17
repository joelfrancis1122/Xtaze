"use client";

import { useState, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2 } from "lucide-react";
import type { Track } from "../types/ITrack";
import { useSelector, useDispatch } from "react-redux";
import { audio } from "../../../utils/audio"; // Global audio instance
import {
  setIsPlaying,
  setCurrentTime,
  setDuration,
  setVolume,
} from "../../../redux/audioSlice";
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

  // Restore audio state on mount and sync isPlaying after refresh
  useEffect(() => {
    if (currentTrack) {
      if (!audio.src) {
        audio.src = currentTrack.fileUrl; // Restore src
        audio.currentTime = reduxCurrentTime; // Restore time
        audio.volume = reduxVolume; // Restore volume
      }
      // Check actual audio state and sync Redux if needed
      if (audio.paused && isPlaying) {
        dispatch(setIsPlaying(false)); // Audio isn’t playing, so set isPlaying to false
      } else if (!audio.paused && !isPlaying) {
        dispatch(setIsPlaying(true)); // Audio is playing, so set isPlaying to true
      }
    }
  }, [currentTrack, isPlaying, reduxCurrentTime, reduxVolume, audio, dispatch]);

  // Sync audio events with local state and Redux
  useEffect(() => {
    const handleTimeUpdate = () => {
      setLocalCurrentTime(audio.currentTime);
      dispatch(setCurrentTime(audio.currentTime));
    };
    const handleLoadedMetadata = () => {
      setLocalDuration(audio.duration);
      dispatch(setDuration(audio.duration));
    };
    const handlePlayEvent = () => dispatch(setIsPlaying(true));
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
  }, [audio, dispatch]);

  const handleVolumeChange = (value: number) => {
    setLocalVolume(value);
    audio.volume = value;
    dispatch(setVolume(value));
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#121212] py-3 px-6 flex items-center justify-between z-50 border-t border-gray-800 shadow-lg">
      {/* Blurry Top Edge */}
      <div
        className="absolute top-0 left-0 right-0 h-1 bg-[#121212] filter blur-3xl"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(18, 18, 18, 0.9), transparent)`,
        }}
      />
      {/* Track Info */}
      <div className="flex items-center w-[300px] relative group z-10">
        <div className="relative w-13 h-13 flex flex-col" onClick={toggleModal}>
          <img
            src={currentTrack.img || "/default-track.jpg"}
            alt="Track Cover Top"
            className="w-fit h-fit object-cover rounded-t-md rounded-b-md shadow-md"
          />
        
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </div>
        </div>
        <div className="ml-3 overflow-hidden">
          <p className="text-sm font-semibold text-white truncate">{currentTrack.title}</p>
          <p className="text-xs text-gray-400 truncate">
            {Array.isArray(currentTrack.artist) ? currentTrack.artist.join(", ") : currentTrack.artist}
          </p>
        </div>
      </div>
      {/* Playback Controls */}
      <div className="flex flex-col items-center gap-2 z-10">
        <div className="flex items-center gap-4">
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
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-[30px] text-right">{formatTime(localCurrentTime)}</span>
          <input
            type="range"
            min="0"
            max={localDuration || 0}
            value={localCurrentTime || 0}
            step="0.02"
            className="w-96 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md"
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
      {/* Volume Control */}
      <div className="flex items-center gap-2 w-[300px] justify-end z-10">
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
  );
}