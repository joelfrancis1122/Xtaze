"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "./userComponents/SideBar";
import MusicPlayer from "./userComponents/TrackBar";
import PreviewModal from "./PreviewPage";
import { WavyBackground } from "../../components/ui/wavy-background";
import type { Track } from "./Types";
import { useDispatch, useSelector } from "react-redux";
import { clearSignupData, saveSignupData } from "../../redux/userSlice";
import {
  setCurrentTrack,
  setIsPlaying,
  toggleShuffle,
  setShuffleIndices,
  setCurrentShuffleIndex,
  toggleRepeat,
  clearAudioState,
} from "../../redux/audioSlice";
import { RootState } from "../../store/store";
import { useNavigate } from "react-router-dom";
import { audio } from "../../utils/audio";
import { PlaceholdersAndVanishInput } from "../../utils/placeholders-and-vanish-input";
import { Search, Power, Play, Pause, Plus, Heart, MoreHorizontal } from "lucide-react";
import { fetchTracks, fetchLikedSongs, incrementListeners, toggleLike } from "../../services/userService";

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

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playedSongs, setPlayedSongs] = useState<Set<string>>(new Set());
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set());
  const [randomIndex, setRandomIndex] = useState<number | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.user.signupData) as UserSignupData | null;
  const { currentTrack, isPlaying, isShuffled, isRepeating, shuffleIndices, currentShuffleIndex } =
    useSelector((state: RootState) => state.audio);

  useEffect(() => {
    if (user?.likedSongs) {
      setLikedSongs(new Set(user.likedSongs.map(String) || []));
    }
  }, [user?.likedSongs]);

  useEffect(() => {
    const getTracksAndLikedSongs = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found or invalid role. Please login.");
        setLoading(false);
        return;
      }

      try {
        // Fetch all tracks
        const { tracks: fetchedTracks, user: updatedUser } = await fetchTracks(
          user?._id || "",
          token,
          user?.premium || false
        );
        setTracks(fetchedTracks);

        // Only dispatch if updatedUser differs significantly (optional optimization)
        if (updatedUser && JSON.stringify(updatedUser) !== JSON.stringify(user)) {
          dispatch(saveSignupData(updatedUser));
        }

        // Fetch liked songs if any
        if (user?.likedSongs && user.likedSongs.length > 0) {
          const liked = await fetchLikedSongs(user._id || "", token, user.likedSongs);
          setLikedTracks(liked);
        } else {
          setLikedTracks([]);
        }
      } catch (error) {
        console.error("Error fetching tracks or liked songs:", error);
      } finally {
        setLoading(false);
      }
    };

    getTracksAndLikedSongs();
  }, [dispatch, user?._id, user?.premium]); // Removed user?.likedSongs from deps

  // Separate effect for setting randomIndex
  useEffect(() => {
    if (user?.premium && tracks.length > 0 && randomIndex === null) {
      setRandomIndex(Math.floor(Math.random() * tracks.length));
    } else if (!user?.premium || tracks.length === 0) {
      setRandomIndex(null);
    }
  }, [user?.premium, tracks.length]); // Only depends on premium and tracks length

  const handleIncrementListeners = async (trackId: string) => {
    const token = localStorage.getItem("token");
    if (!token || !trackId) return;
    try {
      await incrementListeners(trackId, token);
      setTracks((prevTracks) =>
        prevTracks.map((track) =>
          track._id === trackId ? { ...track, listeners: (track.listeners || 0) + 1 } : track
        )
      );
    } catch (error) {
      console.error("Error incrementing listeners:", error);
    }
  };

  const handlePlay = (track: Track) => {
    if (currentTrack?.fileUrl === track.fileUrl) {
      if (isPlaying) {
        audio.pause();
        dispatch(setIsPlaying(false));
      } else {
        audio.play();
        dispatch(setIsPlaying(true));
      }
    } else {
      audio.src = track.fileUrl;
      audio.play();
      dispatch(setCurrentTrack(track));
      dispatch(setIsPlaying(true));
      if (!playedSongs.has(track._id || track.fileUrl)) {
        handleIncrementListeners(track._id || track.fileUrl);
        setPlayedSongs((prev) => new Set(prev).add(track._id || track.fileUrl));
      }
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
        } else {
          newLiked.add(trackId);
        }
        return newLiked;
      });
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const toggleModal = () => {
    setIsModalOpen((prevState) => !prevState);
  };

  const generateShuffleIndices = () => {
    const indices = Array.from({ length: tracks.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  };

  const handleSkipForward = () => {
    if (!currentTrack || tracks.length === 0) return;
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
    if (!isShuffled) {
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

  useEffect(() => {
    const handleEnded = () => {
      if (isRepeating) {
        audio.currentTime = 0;
        audio.play();
      } else if (isShuffled) {
        const nextShuffleIndex = (currentShuffleIndex + 1) % shuffleIndices.length;
        dispatch(setCurrentShuffleIndex(nextShuffleIndex));
        handlePlay(tracks[shuffleIndices[nextShuffleIndex]]);
      } else {
        const currentIndex = tracks.findIndex((track) => track.fileUrl === currentTrack?.fileUrl);
        const nextIndex = (currentIndex + 1) % tracks.length;
        handlePlay(tracks[nextIndex]);
      }
    };
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [audio, isRepeating, isShuffled, currentShuffleIndex, tracks, currentTrack, dispatch]);

  const handleClick = () => {
    audio.pause();
    audio.src = "";
    localStorage.removeItem("token");
    dispatch(clearSignupData());
    dispatch(clearAudioState());
    navigate("/", { replace: true });
  };

  const placeholders = ["Cout me out?", "What's the first rule of Fight Club?", "Send me an angel"];
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => console.log(e.target.value);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("submitted");
  };

  const newArrivals = tracks.slice(0, 5);
  const otherSongs = tracks.slice(5);

  const handleUpgradeClick = () => {
    navigate("/plans");
  };

  return (
    <div className="flex h-screen flex-col bg-black text-white">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 min-h-screen ml-64 bg-black overflow-y-auto">
          <header className="flex justify-between items-center p-4 sticky top-0 bg-black z-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={20} />
              <PlaceholdersAndVanishInput placeholders={placeholders} onChange={handleChange} onSubmit={onSubmit} />
            </div>
            <button className="p-2 hover:bg-[#242424] rounded-full" onClick={handleClick}>
              <Power size={20} />
            </button>
          </header>

          <section className="px-6 py-4 pb-25">
            <div className="mb-8">
              {user?.premium && randomIndex !== null ? (
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
                        {Array.isArray(tracks[randomIndex]?.artist)
                          ? tracks[randomIndex]?.artist.join(", ")
                          : tracks[randomIndex]?.artist || "Various Artists"}
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

            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">New Arrivals</h2>
              {loading ? (
                <div className="text-center py-4">Loading tracks...</div>
              ) : (
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
                        {Array.isArray(track.artist) ? track.artist.join(", ") : track.artist}
                      </div>
                      <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 hover:bg-[#333333] rounded-full">
                          <Plus size={16} />
                        </button>
                        {user?.premium ? (
                          <button
                            onClick={() => handleLike(track._id || track.fileUrl)}
                            className={`p-1 hover:bg-[#333333] rounded-full ${
                              likedSongs.has(track._id || track.fileUrl) ? "text-red-500" : "text-white"
                            }`}
                          >
                            <Heart
                              size={16}
                              fill={likedSongs.has(track._id || track.fileUrl) ? "currentColor" : "none"}
                            />
                          </button>
                        ) : null}
                        <button className="p-1 hover:bg-[#333333] rounded-full">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Explore More</h2>
              {loading ? (
                <div className="text-center py-4">Loading tracks...</div>
              ) : (
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
                        {Array.isArray(track.artist) ? track.artist.join(", ") : track.artist}
                      </div>
                      <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 hover:bg-[#333333] rounded-full">
                          <Plus size={16} />
                        </button>
                        <button
                          onClick={() => handleLike(track._id || track.fileUrl)}
                          className={`p-1 hover:bg-[#333333] rounded-full ${
                            likedSongs.has(track._id || track.fileUrl) ? "text-red-500" : "text-white"
                          }`}
                        >
                          <Heart
                            size={16}
                            fill={likedSongs.has(track._id || track.fileUrl) ? "currentColor" : "none"}
                          />
                        </button>
                        <button className="p-1 hover:bg-[#333333] rounded-full">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
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
        <PreviewModal track={currentTrack} isOpen={isModalOpen} toggleModal={toggleModal} />
      )}
    </div>
  );
}