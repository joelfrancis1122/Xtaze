
import { useEffect, useRef } from "react"; // Add useRef
import { useDispatch, useSelector } from "react-redux";
import { Track } from "../types/ITrack";
import { RootState } from "../../../store/store";
import { setCurrentShuffleIndex, setCurrentTrack, setIsPlaying, setShuffleIndices, toggleRepeat, toggleShuffle } from "../../../redux/audioSlice";
import { audio } from "../../../utils/audio";

interface QueueTrack {
  id: string;
  title: string;
  artists: string | string[];
  fileUrl: string;
  img?: string;
}

export const useAudioPlayback = (tracks: Track[]) => {
  const dispatch = useDispatch();
  const {
    currentTrack,
    isPlaying,
    isShuffled,
    isRepeating,
    shuffleIndices,
    currentShuffleIndex,
  } = useSelector((state: RootState) => state.audio);
  const playHandlerRef = useRef<(() => void) | null>(null); // Store the current handler

  const generateShuffleIndices = () => {
    const indices = Array.from({ length: tracks.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  };

  const handlePlay = (track: Track) => {
    if (currentTrack?.fileUrl === track.fileUrl) {
      if (isPlaying) {
        audio.pause();
        dispatch(setIsPlaying(false));
      } else {
        audio.play().catch((err) => console.error("Play error:", err));
        dispatch(setIsPlaying(true));
      }
    } else {
      // Remove any existing canplay listener
      if (playHandlerRef.current) {
        audio.removeEventListener("canplay", playHandlerRef.current);
      }

      audio.src = track.fileUrl;
      dispatch(setCurrentTrack(track));
      dispatch(setIsPlaying(true));

      const playWhenReady = () => {
        audio.play().catch((err) => console.error("Play error:", err));
        audio.removeEventListener("canplay", playWhenReady);
        playHandlerRef.current = null; // Clear ref after playing
      };
      audio.addEventListener("canplay", playWhenReady);
      playHandlerRef.current = playWhenReady; // Store the handler

      updateRecentSongs(track);
    }
  };

  const handleSkipForward = () => {
    if (!currentTrack || tracks.length === 0) return;

    const storedQueue = JSON.parse(localStorage.getItem("playQueue") || "[]");
    if (storedQueue.length > 0) {
      let updatedQueue = storedQueue;
      const currentQueueIndex = storedQueue.findIndex((q: QueueTrack) => q.fileUrl === currentTrack.fileUrl);
      
      if (currentQueueIndex !== -1) {
        updatedQueue = storedQueue.filter((_: QueueTrack, i: number) => i !== currentQueueIndex);
      }

      const nextTrack = updatedQueue[0];
      if (nextTrack) {
        updatedQueue.shift();
        localStorage.setItem("playQueue", JSON.stringify(updatedQueue));
        audio.src = nextTrack.fileUrl;
        audio.play().catch((err) => console.error("Play error:", err));
        dispatch(setCurrentTrack(nextTrack));
        dispatch(setIsPlaying(true));
        updateRecentSongs(nextTrack);
        return;
      } else {
        localStorage.setItem("playQueue", JSON.stringify([]));
      }
    }

    if (isShuffled) {
      const nextShuffleIndex = (currentShuffleIndex + 1) % shuffleIndices.length;
      dispatch(setCurrentShuffleIndex(nextShuffleIndex));
      handlePlay(tracks[shuffleIndices[nextShuffleIndex]]);
    } else {
      const currentIndex = tracks.findIndex((track) => track.fileUrl === currentTrack.fileUrl);
      const nextIndex = (currentIndex + 1) % tracks.length;
      handlePlay(tracks[nextIndex]);
    }
  };

  const handleSkipBack = () => {
    if (!currentTrack || tracks.length === 0) return;

    if (isShuffled) {
      const prevShuffleIndex =
        currentShuffleIndex === 0 ? shuffleIndices.length - 1 : currentShuffleIndex - 1;
      dispatch(setCurrentShuffleIndex(prevShuffleIndex));
      handlePlay(tracks[shuffleIndices[prevShuffleIndex]]);
    } else {
      const currentIndex = tracks.findIndex((track) => track.fileUrl === currentTrack.fileUrl);
      const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
      handlePlay(tracks[prevIndex]);
    }
  };

  const handleToggleShuffle = () => {
    dispatch(toggleShuffle());
    if (!isShuffled && tracks.length > 0) {
      const newShuffleIndices = generateShuffleIndices();
      dispatch(setShuffleIndices(newShuffleIndices));
      if (currentTrack) {
        const currentIndex = tracks.findIndex((track) => track.fileUrl === currentTrack.fileUrl);
        dispatch(setCurrentShuffleIndex(newShuffleIndices.indexOf(currentIndex)));
      }
    }
  };

  const handleToggleRepeat = () => {
    dispatch(toggleRepeat());
    audio.loop = !isRepeating;
  };

  const updateRecentSongs = (track: Track) => {
    const trackId = track._id || track.fileUrl;
    const recentSongs = JSON.parse(localStorage.getItem("recentSongs") || "[]");
    const newEntry = { id: trackId, playedAt: new Date().toISOString() };
    const updatedSongs = [
      newEntry,
      ...recentSongs.filter((s: any) => s.id !== trackId),
    ].slice(0, 20);
    localStorage.setItem("recentSongs", JSON.stringify(updatedSongs));
  };

  useEffect(() => {
    const handleEnded = () => {
      if (isRepeating) {
        audio.currentTime = 0;
        audio.play().catch((err) => console.error("Play error:", err));
      } else {
        handleSkipForward();
      }
    };
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [isRepeating, isShuffled, currentShuffleIndex, tracks, currentTrack]);

  return {
    handlePlay,
    handleSkipBack,
    handleSkipForward,
    handleToggleShuffle,
    handleToggleRepeat,
  };
};