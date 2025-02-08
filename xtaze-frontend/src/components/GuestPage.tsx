import { Heart, MoreHorizontal, Plus, Search, Bell, Play, Pause, Volume2, SkipBack, SkipForward, Repeat, Shuffle } from "lucide-react";
import { useEffect, useState, } from "react";
import "./AudioPlayer.css"
import PreviewModal from "../pages/PreviewPage";


export interface Track {
  title: string;
  artist: string;
  fileUrl: string;
  img: string;
  genre:string;
}

const formatTime = (time: number): string => {
  if (!time || isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default function MusicInterface() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [audio] = useState(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [shuffleIndices, setShuffleIndices] = useState<number[]>([]);
  const [currentShuffleIndex, setCurrentShuffleIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen((prevState) => !prevState);
    console.log("prevss s")
  };

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/songs/deezer");
        if (!response.ok) {
          throw new Error("Failed to fetch tracks");
        }
        const data = await response.json();
        setTracks(data.songs);
        console.log(data.songs, "data")
      } catch (error) {
        console.error("Error fetching tracks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, []);

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

  const handleTimeUpdate = () => {
    if (audio.currentTime >= audio.duration) {
      setCurrentTime(audio.duration);
    } else {
      setCurrentTime(audio.currentTime);
    }
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    audio.volume = value;
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
      const currentIndex = tracks.findIndex(track => track.fileUrl === currentlyPlaying);
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
      const currentIndex = tracks.findIndex(track => track.fileUrl === currentlyPlaying);
      const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
      handlePlay(tracks[prevIndex]);
    }
  };

  const toggleShuffle = () => {
    if (!isShuffled) {
      const newShuffleIndices = generateShuffleIndices();
      setShuffleIndices(newShuffleIndices);
      if (currentTrack) {
        const currentIndex = tracks.findIndex(track => track.fileUrl === currentlyPlaying);
        setCurrentShuffleIndex(newShuffleIndices.indexOf(currentIndex));
      }
    }
    setIsShuffled(!isShuffled);
  };

  const toggleRepeat = () => {
    setIsRepeating(!isRepeating);
    audio.loop = !isRepeating;
  };

  useEffect(() => {
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });

    const handleEnded = () => {
      if (isRepeating) {
        // If repeat is on, replay the same song
        audio.currentTime = 0;
        audio.play();
      } else if (isShuffled) {
        // If shuffle is on, play a random next song
        const nextShuffleIndex = (currentShuffleIndex + 1) % shuffleIndices.length;
        setCurrentShuffleIndex(nextShuffleIndex);
        handlePlay(tracks[shuffleIndices[nextShuffleIndex]]);
      } else {
        // Normal play - go to next song
        const currentIndex = tracks.findIndex(track => track.fileUrl === currentlyPlaying);
        const nextIndex = (currentIndex + 1) % tracks.length;
        handlePlay(tracks[nextIndex]);
      }
    };

    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", () => { });
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audio, isRepeating, isShuffled, currentShuffleIndex, tracks, currentlyPlaying]);

  useEffect(() => {
    return () => {
      audio.pause();
    };
  }, [audio]);
  console.log(isModalOpen, "modal enganaaan ippa ");

  return (
    <div className="flex h-screen flex-col bg-black text-white">
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 p-6 bg-[#121212] h-full">
          <nav className="space-y-6">
            <div className="space-y-2">
              <a href="#" className="text-white hover:text-primary block">Home</a>
              <a href="#" className="text-white hover:text-primary block">Explore</a>
              <a href="#" className="text-white hover:text-primary block">Videos</a>
            </div>
            <div className="pt-4">
              <h3 className="text-sm uppercase text-gray-400 mb-4">MY COLLECTION</h3>
              <div className="space-y-2">
                <a href="#" className="text-gray-300 hover:text-white block">Mixes & Radio</a>
                <a href="#" className="text-gray-300 hover:text-white block">Playlists</a>
                <a href="#" className="text-gray-300 hover:text-white block">Albums</a>
                <a href="#" className="text-gray-300 hover:text-white block">Tracks</a>
                <a href="#" className="text-gray-300 hover:text-white block">Videos</a>
                <a href="#" className="text-gray-300 hover:text-white block">Artists</a>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-24 bg-black">
          <header className="flex justify-between items-center p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="search"
                placeholder="Search"
                className="bg-[#242424] rounded-full py-2 pl-10 pr-4 w-[300px] text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button className="p-2 hover:bg-[#242424] rounded-full">
              <Bell size={20} />
            </button>
          </header>

          {/* Tracks Section */}
          <section className="px-6 py-4">
            <h2 className="text-2xl font-bold mb-4">Trending Tracks</h2>
            {loading ? (
              <div className="text-center py-4">Loading tracks...</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-400 border-b border-gray-800">
                    <th className="pb-2"></th>
                    <th className="pb-2">TITLE</th>
                    <th className="pb-2">ARTIST</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {tracks.map((track, index) => (
                    <tr key={index} className="group hover:bg-[#242424]">
                      {/* Track Image and Play Button */}
                      <td className="py-2 w-16 relative flex items-center justify-center">
                        <img
                          src={track.img || "/default-track.jpg"}
                          alt={track.title}
                          width={40}
                          height={40}
                          className="rounded"
                        />
                        <button
                          onClick={() => handlePlay(track)}
                          className="absolute inset-0 flex items-center justify-center p-1 rounded-full opacity-0 group-hover:opacity-100"
                        >
                          {currentlyPlaying === track.fileUrl && isPlaying ? <Pause size={16} /> : <Play size={16} />}
                        </button>
                      </td>

                      {/* Track Title */}
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{track.title}</span>
                        </div>
                      </td>

                      {/* Track Artist */}
                      <td className="py-2 text-gray-400">{track.artist}</td>

                      {/* Actions */}
                      <td className="py-2">
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            )}
          </section>
        </main>
      </div>

      {/* Sticky Music Player */}
      {currentlyPlaying && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#121212] py-4 px-6 flex items-center justify-between z-50">
          <div className="flex items-center w-[300px] relative group">
            <div className="relative" onClick={toggleModal} >
              <img
                src={currentTrack?.img || "/default-track.jpg"}
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
              <p className="text-sm font-bold truncate">{currentTrack?.title}</p>
              <p className="text-xs text-gray-400 truncate">{currentTrack?.artist}</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleShuffle}
                className={`p-2 hover:bg-[#333333] rounded-full ${isShuffled ? 'text-red-500' : ''}`}
              >
                <Shuffle size={20} />
              </button>
              <button
                onClick={handleSkipBack}
                className="p-2 hover:bg-[#333333] rounded-full"
              >
                <SkipBack size={20} />
              </button>
              <button
                onClick={() => currentTrack && handlePlay(currentTrack)}
                className="hover:opacity-80"
              >
                {isPlaying ? <Pause size={32} /> : <Play size={32} />}
              </button>
              <button
                onClick={handleSkipForward}
                className="p-2 hover:bg-[#333333] rounded-full"
              >
                <SkipForward size={20} />
              </button>
              <button
                onClick={toggleRepeat}
                className={`p-2 hover:bg-[#333333] rounded-full ${isRepeating ? 'text-red-500' : ''}`}
              >
                <Repeat size={20} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-[30px] text-right">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime || 0}
                step="0.02"
                className="w-96 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-black"
                onChange={(e) => {
                  const newTime = parseFloat(e.target.value);
                  audio.currentTime = newTime;
                  setCurrentTime(newTime);
                }}
              />
              <span className="text-xs text-gray-400 w-[30px]">
                {formatTime(duration)}
              </span>
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
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            />
          </div>
        </div>
      )}

      {isModalOpen && (
        <PreviewModal track={currentTrack!} />
      )}


    </div>
  );
}
