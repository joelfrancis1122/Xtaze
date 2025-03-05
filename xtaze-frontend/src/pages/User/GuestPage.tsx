"use client";

import { Search, Power, Play, Pause, Plus, Heart, MoreHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "./userComponents/SideBar"; // Assuming reusable Sidebar
import MusicPlayer from "./userComponents/TrackBar";
import PreviewModal from "./PreviewPage";
import type { Track } from "./Types";
import { audio } from "../../utils/audio";
import { PlaceholdersAndVanishInput } from "../../utils/placeholders-and-vanish-input";
import axios from "axios";

export default function MusicInterface() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [audio] = useState(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [shuffleIndices, setShuffleIndices] = useState<number[]>([]);
  const [currentShuffleIndex, setCurrentShuffleIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const baseUrl = import.meta.env.VITE_BASE_URL;
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/songs/deezer`);
        if (!response.data) {
          throw new Error("Failed to fetch tracks");
        }
        const data = await response.data();
        setTracks(data.songs);
      } catch (error) {
        console.error("Error fetching tracks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, []);

  const toggleModal = () => {
    setIsModalOpen((prevState) => !prevState);
  };

  const handlePlay = (track: Track) => {
    if (currentlyPlaying === track.fileUrl) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
    } else {
      audio.src = track.fileUrl;
      audio.play();
      setCurrentlyPlaying(track.fileUrl);
      setCurrentTrack(track);
      setIsPlaying(true);
    }
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
      setCurrentShuffleIndex(nextShuffleIndex);
      handlePlay(tracks[shuffleIndices[nextShuffleIndex]]);
    } else {
      const currentIndex = tracks.findIndex((track) => track.fileUrl === currentlyPlaying);
      const nextIndex = (currentIndex + 1) % tracks.length;
      handlePlay(tracks[nextIndex]);
    }
  };

  const handleSkipBack = () => {
    if (!currentTrack || tracks.length === 0) return;
    if (isShuffled) {
      const prevShuffleIndex = currentShuffleIndex === 0 ? shuffleIndices.length - 1 : currentShuffleIndex - 1;
      setCurrentShuffleIndex(prevShuffleIndex);
      handlePlay(tracks[shuffleIndices[prevShuffleIndex]]);
    } else {
      const currentIndex = tracks.findIndex((track) => track.fileUrl === currentlyPlaying);
      const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
      handlePlay(tracks[prevIndex]);
    }
  };

  const handleToggleShuffle = () => {
    if (!isShuffled) {
      const newShuffleIndices = generateShuffleIndices();
      setShuffleIndices(newShuffleIndices);
      if (currentTrack) {
        const currentIndex = tracks.findIndex((track) => track.fileUrl === currentlyPlaying);
        setCurrentShuffleIndex(newShuffleIndices.indexOf(currentIndex));
      }
    }
    setIsShuffled(!isShuffled);
  };

  const handleToggleRepeat = () => {
    setIsRepeating(!isRepeating);
    audio.loop = !isRepeating;
  };

  useEffect(() => {
    const handleEnded = () => {
      if (isRepeating) {
        audio.currentTime = 0;
        audio.play();
      } else if (isShuffled) {
        const nextShuffleIndex = (currentShuffleIndex + 1) % shuffleIndices.length;
        setCurrentShuffleIndex(nextShuffleIndex);
        handlePlay(tracks[shuffleIndices[nextShuffleIndex]]);
      } else {
        const currentIndex = tracks.findIndex((track) => track.fileUrl === currentlyPlaying);
        const nextIndex = (currentIndex + 1) % tracks.length;
        handlePlay(tracks[nextIndex]);
      }
    };
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [audio, isRepeating, isShuffled, currentShuffleIndex, tracks, currentlyPlaying]);

  useEffect(() => {
    return () => {
      audio.pause();
    };
  }, [audio]);

  const handleClick = () => {
    audio.pause();
    audio.src = "";
    // No token or Redux state to clear for guest user
  };

  const placeholders = ["Cout me out?", "What's the first rule of Fight Club?", "Send me an angel"];
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => console.log(e.target.value);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("submitted");
  };

  const newArrivals = tracks.slice(0, 5);
  const otherSongs = tracks.slice(5);
  const randomIndex = useMemo(() => Math.floor(Math.random() * tracks.length), [tracks]);

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
              <h2 className="text-3xl font-bold mb-4">Featured Today</h2>
              <div
                className="relative w-full h-[300px] bg-[#1d1d1d] rounded-lg overflow-hidden cursor-pointer shadow-lg"
                onClick={() => tracks[randomIndex] && handlePlay(tracks[randomIndex])}
              >
                <img
                  src={tracks[randomIndex]?.img || "/placeholder.svg"}
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
                    {tracks[randomIndex]?.artist
                      ? Array.isArray(tracks[randomIndex].artist)
                        ? tracks[randomIndex].artist.join(", ")
                        : tracks[randomIndex].artist
                      : "Various Artists"}
                  </p>
                </div>
              </div>
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
                            {currentlyPlaying === track.fileUrl && isPlaying ? (
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
                        <button className="p-1 hover:bg-[#333333] rounded-full">
                          <Heart size={16} />
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
                            {currentlyPlaying === track.fileUrl && isPlaying ? (
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
                        <button className="p-1 hover:bg-[#333333] rounded-full">
                          <Heart size={16} />
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

      <div
        className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-all duration-300 ease-in-out ${
          isModalOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
        }`}
      >
        {isModalOpen && currentTrack && <PreviewModal track={currentTrack} isOpen={isModalOpen} toggleModal={toggleModal} />}
      </div>
    </div>
  );
}