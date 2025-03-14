import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Clock, Heart, MoreHorizontal, Play, PauseCircle, PlayCircle, Share2, Shuffle, ChevronLeft } from "lucide-react";
import Sidebar from "./userComponents/SideBar";
import { fetchPlaylistTracks } from "../../services/userService";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { setCurrentTrack, setIsPlaying } from "../../redux/audioSlice";
import { audio } from "../../utils/audio";
import MusicPlayer from "./userComponents/TrackBar";
import image from "../../assets/ab67706f0000000216605bf6c66f6e5a783411b8.jpeg"
import PreviewModal from "./PreviewPage";

interface Track {
  _id: string;
  title: string;
  album: string;
  artists: string;
  genre: string;
  fileUrl: string;
  img: string;
  listeners: number;
}

export default function PlaylistPageView() {
  const { id } = useParams();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const { currentTrack, isPlaying } = useSelector((state: RootState) => state.audio);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate()
  useEffect(() => {
    const fetchTracksFromPlaylist = async () => {
      try {
        setLoading(true);
        const response = await fetchPlaylistTracks(id as string);
        console.log(response, "jerry");
        setTracks(response);
        console.log(response, "ithan athinte reposinse");
        setError(null);
      } catch (err) {
        setError("Failed to load tracks");
      } finally {
        setLoading(false);
      }
    };
    fetchTracksFromPlaylist();
  }, [id]);

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
    }
  };

  const handleSkipBack = () => {
    const currentIndex = tracks.findIndex((t) => t._id === currentTrack?._id);
    if (currentIndex > 0) {
      const prevTrack = tracks[currentIndex - 1];
      audio.src = prevTrack.fileUrl;
      audio.play();
      dispatch(setCurrentTrack(prevTrack));
      dispatch(setIsPlaying(true));
    }
  };

  const handleSkipForward = () => {
    const currentIndex = tracks.findIndex((t) => t._id === currentTrack?._id);
    if (currentIndex < tracks.length - 1) {
      const nextTrack = tracks[currentIndex + 1];
      audio.src = nextTrack.fileUrl;
      audio.play();
      dispatch(setCurrentTrack(nextTrack));
      dispatch(setIsPlaying(true));
    }
  };

  const toggleShuffle = () => {
    setIsShuffled((prev) => !prev);
    // Add shuffle logic here if desired (e.g., shuffle tracks array)
  };

  const toggleRepeat = () => {
    setIsRepeating((prev) => !prev);
    audio.loop = !audio.loop;
  };

  const toggleModal = () => {
    setIsModalOpen((prevState) => !prevState);
    console.log("Toggle modal placeholder");
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />

      <div className="flex-1 ml-64 py-7 px-6 pb-20">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-gray-700 flex items-center relative absolute justify-center hover:bg-gray-600 transition mb-4"
          title="Go back"
        >
          <ChevronLeft className="h-5 w-5 text-gray-400" />
        </button>
        {/* Header Section */}
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-60 h-60 rounded-xl overflow-hidden shadow-lg">
                <img src={image} alt="Playlist cover" className="w-full h-full object-cover" />
              </div>
              <div>

                <p className="text-sm text-gray-400 uppercase">Playlist</p>
                <h1 className="text-5xl font-bold">Electronic Essentials</h1>
                <p className="text-gray-400 text-base mt-2">
                  The best electronic tracks from around the world. Updated weekly.
                </p>
              </div>
            </div>
            <p className="text-gray-400 text-base">{tracks.length} songs</p>
          </div>

          {/* Controls Section */}
          <div className="flex items-center gap-4">
            <button className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition">
              <Play className="h-6 w-6" />
            </button>
            <button className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition">
              <Shuffle className="h-5 w-5" />
            </button>
            <button className="ml-auto w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition">
              <Share2 className="h-5 w-5" />
            </button>
            <button className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>

          {/* Tracks Section */}
          {loading ? (
            <p className="text-gray-400 text-center py-4">Loading tracks...</p>
          ) : error ? (
            <p className="text-red-400 text-center py-4">{error}</p>
          ) : tracks.length > 0 ? (
            <div className="bg-[#151515] rounded-xl shadow-lg border border-gray-900 overflow-hidden">
              <div className="grid grid-cols-[48px_2fr_1fr_1fr_48px] gap-4 px-6 py-4 text-gray-400 text-lg font-semibold border-b border-gray-700">
                <span className="text-center">#</span>
                <span>Title</span>
                <span>Artist</span>
                <span>Album</span>
                <span className="text-right"><Clock className="h-4 w-4" /></span>
              </div>
              {tracks.map((track, index) => (
                <div
                  key={track._id}
                  className="grid grid-cols-[48px_2fr_1fr_1fr_48px] gap-4 px-6 py-4 hover:bg-[#212121] transition-all duration-200 cursor-pointer items-center group"
                >
                  <span className="text-gray-400 text-lg text-center">{index + 1}</span>
                  <div className="flex items-center space-x-4 truncate">
                    <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={track.img || "/placeholder.svg"}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handlePlay(track)}
                        className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
                      >
                        {currentTrack?.fileUrl === track.fileUrl && isPlaying ? (
                          <PauseCircle size={24} className="text-white" />
                        ) : (
                          <PlayCircle size={24} className="text-white" />
                        )}
                      </button>
                    </div>
                    <div className="truncate">
                      <p className="text-white font-medium text-lg truncate">{track.title}</p>
                    </div>
                  </div>
                  <span className="text-gray-400 text-lg truncate">
                    {Array.isArray(track.artists) ? track.artists.join(", ") : track.artists}
                  </span>
                  <span className="text-gray-400 text-lg truncate">{track.album}</span>
                  <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {/* Optional: Add controls here if needed */}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#1d1d1d] p-8 rounded-xl shadow-md border border-gray-800 text-center">
              <p className="text-gray-400 text-lg">No tracks in this playlist yet.</p>
            </div>
          )}
        </div>

        {/* Music Player Bar */}
        {currentTrack && (
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
           {currentTrack && (
        <PreviewModal track={currentTrack} isOpen={isModalOpen} toggleModal={toggleModal} />
      )}
      </div>
    </div>
  );
}