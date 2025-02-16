"use client"

import { useState, useEffect } from "react"
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2 } from "lucide-react"
import type { Track } from "../Types"

interface MusicPlayerProps {
    
  currentTrack: Track | null
  isPlaying: boolean
  handlePlay: (track: Track) => void
  handleSkipBack: () => void
  handleSkipForward: () => void
  toggleShuffle: () => void
  toggleRepeat: () => void
  isShuffled: boolean
  isRepeating: boolean
  audio: HTMLAudioElement
  toggleModal: () => void
}

const formatTime = (time: number): string => {
  if (!time || isNaN(time)) return "0:00"
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

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
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)

  useEffect(() => {
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedMetadata = () => setDuration(audio.duration)

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
    }
  }, [audio])

  const handleVolumeChange = (value: number) => {
    setVolume(value)
    audio.volume = value
  }

  if (!currentTrack) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#121212] py-4 px-6 flex items-center justify-between z-50">
      <div className="flex items-center w-[300px] relative group">
        <div className="relative" onClick={toggleModal}>
          <img
            src={currentTrack.img || "/default-track.jpg"}
            alt="Track Cover"
            className="w-14 h-14 rounded cursor-pointer"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
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
        <div className="ml-4 overflow-hidden">
          <p className="text-sm font-bold truncate">{currentTrack.title}</p>
          <p className="text-xs text-gray-400 truncate">
            {Array.isArray(currentTrack.artist) ? currentTrack.artist.join(", ") : currentTrack.artist}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleShuffle}
            className={`p-2 hover:bg-[#333333] rounded-full ${isShuffled ? "text-red-500" : ""}`}
          >
            <Shuffle size={20} />
          </button>
          <button onClick={handleSkipBack} className="p-2 hover:bg-[#333333] rounded-full">
            <SkipBack size={20} />
          </button>
          <button onClick={() => handlePlay(currentTrack)} className="hover:opacity-80">
            {isPlaying ? <Pause size={32} /> : <Play size={32} />}
          </button>
          <button onClick={handleSkipForward} className="p-2 hover:bg-[#333333] rounded-full">
            <SkipForward size={20} />
          </button>
          <button
            onClick={toggleRepeat}
            className={`p-2 hover:bg-[#333333] rounded-full ${isRepeating ? "text-red-500" : ""}`}
          >
            <Repeat size={20} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-[30px] text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime || 0}
            step="0.02"
            className="w-96 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-black"
            onChange={(e) => {
              const newTime = Number.parseFloat(e.target.value)
              audio.currentTime = newTime
              setCurrentTime(newTime)
            }}
          />
          <span className="text-xs text-gray-400 w-[30px]">{formatTime(duration)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 w-[300px] justify-end">
        <Volume2 size={20} />
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-black"
          onChange={(e) => handleVolumeChange(Number.parseFloat(e.target.value))}
        />
      </div>
    </div>
  )
}

