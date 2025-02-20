import { Search, Power, Play, Pause, Plus, Heart, MoreHorizontal } from "lucide-react"
import { useEffect, useState } from "react"
import Sidebar from "./userComponents/SideBar"
import MusicPlayer from "./userComponents/TrackBar"
import PreviewModal from "./PreviewPage"
import type { Track } from "./Types"
import { useDispatch } from "react-redux"
import { clearSignupData } from "../../redux/userSlice"
import { useNavigate } from "react-router-dom"

export default function Home() {



  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [audio] = useState(new Audio())
  const [isPlaying, setIsPlaying] = useState(false)
  const [isShuffled, setIsShuffled] = useState(false)
  const [isRepeating, setIsRepeating] = useState(false)
  const [shuffleIndices, setShuffleIndices] = useState<number[]>([])
  const [currentShuffleIndex, setCurrentShuffleIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const toggleModal = () => {
    setIsModalOpen((prevState) => !prevState)
  }
  useEffect(() => {
    const fetchTracks = async () => {
      const token = localStorage.getItem("token");
      if (!token ) {
        console.error("No token found or invalid role. Please login.");
        return;
      }
  
      try {
        const response = await fetch("http://localhost:3000/provider/getAllTracks", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, 
          },
        });
  
        if (!response.ok) throw new Error("Failed to fetch tracks");
  
        const data = await response.json();
        const formattedTracks: Track[] = data.map((track: any) => ({
          title: track.title,
          album: track.album,
          artist: track.artists,
          genre: track.genre,
          fileUrl: track.fileUrl,
          img: track.img,
        }));
  
        setTracks(formattedTracks);
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
        audio.pause()
        setIsPlaying(false)
      } else {
        audio.play()
        setIsPlaying(true)
      }
    } else {
      audio.src = track.fileUrl
      audio.play()
      setCurrentlyPlaying(track.fileUrl)
      setCurrentTrack(track)
      setIsPlaying(true)
    }
  }

  const generateShuffleIndices = () => {
    const indices = Array.from({ length: tracks.length }, (_, i) => i)
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
        ;[indices[i], indices[j]] = [indices[j], indices[i]]
    }
    return indices
  }

  const handleSkipForward = () => {
    if (!currentTrack || tracks.length === 0) return

    if (isShuffled) {
      const nextShuffleIndex = (currentShuffleIndex + 1) % shuffleIndices.length
      setCurrentShuffleIndex(nextShuffleIndex)
      handlePlay(tracks[shuffleIndices[nextShuffleIndex]])
    } else {
      const currentIndex = tracks.findIndex((track) => track.fileUrl === currentlyPlaying)
      const nextIndex = (currentIndex + 1) % tracks.length
      handlePlay(tracks[nextIndex])
    }
  }

  const handleSkipBack = () => {
    if (!currentTrack || tracks.length === 0) return

    if (isShuffled) {
      const prevShuffleIndex = currentShuffleIndex === 0 ? shuffleIndices.length - 1 : currentShuffleIndex - 1
      setCurrentShuffleIndex(prevShuffleIndex)
      handlePlay(tracks[shuffleIndices[prevShuffleIndex]])
    } else {
      const currentIndex = tracks.findIndex((track) => track.fileUrl === currentlyPlaying)
      const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1
      handlePlay(tracks[prevIndex])
    }
  }

  const toggleShuffle = () => {
    if (!isShuffled) {
      const newShuffleIndices = generateShuffleIndices()
      setShuffleIndices(newShuffleIndices)
      if (currentTrack) {
        const currentIndex = tracks.findIndex((track) => track.fileUrl === currentlyPlaying)
        setCurrentShuffleIndex(newShuffleIndices.indexOf(currentIndex))
      }
    }
    setIsShuffled(!isShuffled)
  }

  const toggleRepeat = () => {
    setIsRepeating(!isRepeating)
    audio.loop = !isRepeating
  }

  useEffect(() => {
    const handleEnded = () => {
      if (isRepeating) {
        audio.currentTime = 0
        audio.play()
      } else if (isShuffled) {
        const nextShuffleIndex = (currentShuffleIndex + 1) % shuffleIndices.length
        setCurrentShuffleIndex(nextShuffleIndex)
        handlePlay(tracks[shuffleIndices[nextShuffleIndex]])
      } else {
        const currentIndex = tracks.findIndex((track) => track.fileUrl === currentlyPlaying)
        const nextIndex = (currentIndex + 1) % tracks.length
        handlePlay(tracks[nextIndex])
      }
    }

    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("ended", handleEnded)
    }
  }, [audio, isRepeating, isShuffled, currentShuffleIndex, tracks, currentlyPlaying, handlePlay])

  useEffect(() => {
    return () => {
      audio.pause()
    }
  }, [audio])
  const handleClick = () => {
    // Clear localStorage
    localStorage.removeItem("token");
    
    // Dispatch the action to clear user data from Redux
    dispatch(clearSignupData());

    // Optionally, redirect to the login page
    navigate("/", { replace: true });
  };
  return (
    <div className="flex h-screen flex-col bg-black text-white">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 min-h-screen ml-64 bg-black">
          <header className="flex justify-between items-center p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="search"
                placeholder="Search"
                className="bg-[#242424] rounded-full py-2 pl-10 pr-4 w-[300px] text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button className="p-2 hover:bg-[#242424] rounded-full" onClick={handleClick}>
              <Power size={20} />
            </button>
          </header>

          <section className="px-6 py-4 pb-25">
            <h2 className="text-2xl font-bold mb-4">Trending Tracks</h2>
            {loading ? (
              <div className="text-center py-4">Loading tracks...</div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-800 text-sm text-gray-400">
                    <th className="relative flex items-center w-10 ml-5">#</th>
                    <th className="pb-2 -ml-2">TITLE</th>
                    <th className="pb-2">ARTIST</th>
                    <th className="pb-2">ALBUM</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {tracks.map((track, index) => (
                    <tr key={index} className="group hover:bg-[#1d1d1d]">
                      <td className="py-2 w-16 relative rounded-l-lg">
                        <div className="relative flex items-center w-10 h-10 ml-2">
                          <img
                            src={track.img || "/placeholder.svg"}
                            alt="Track Cover"
                            className="w-full h-full object-cover rounded relative z-1"
                          />
                          <div className="absolute inset-0.5 bg-red-500 opacity-50 rounded-full blur-md"></div>
                          <button
                            onClick={() => handlePlay(track)}
                            className="absolute inset-0 flex items-center justify-center bg-black/50 p-2 opacity-0 group-hover:opacity-100 transition-opacity z-2"
                          >
                            {currentlyPlaying === track.fileUrl && isPlaying ? (
                              <Pause size={16} className="text-white" />
                            ) : (
                              <Play size={16} className="text-white" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-2 text-white">
                        <div className="flex items-center gap-1">
                          <span className="truncate">{track.title}</span>
                        </div>
                      </td>
                      <td className="py-2 text-gray-400">
                        {Array.isArray(track.artist) ? track.artist.join(", ") : JSON.parse(track.artist).join(", ")}
                      </td>
                      <td className="py-2 text-gray-400 whitespace-nowrap">{track.album}</td>
                      <td className="py-2 rounded-r-lg">
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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

      {currentlyPlaying && (
        <MusicPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          handlePlay={handlePlay}
          handleSkipBack={handleSkipBack}
          handleSkipForward={handleSkipForward}
          toggleShuffle={toggleShuffle}
          toggleRepeat={toggleRepeat}
          isShuffled={isShuffled}
          isRepeating={isRepeating}
          audio={audio}
          toggleModal={toggleModal}
        /> 
      )}

      {isModalOpen && <PreviewModal track={currentTrack!} />}
    </div>
  )
}

