import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import Sidebar from "./userComponents/SideBar";
import { toast } from "sonner";
import { Play, Pause, ArrowLeft, Share2 } from "lucide-react";
import { cn } from "../../../lib/utils";
import { IAlbum, ISong } from "../User/types/IAlbums";
import { fetchAlbumSongs } from "../../services/userService";
import { useDispatch, useSelector } from "react-redux";
import { useAudioPlayback } from "./userComponents/audioPlayback";
import { RootState } from "../../store/store";
import { audio } from "../../utils/audio";
import MusicPlayer from "./userComponents/TrackBar";
import PreviewModal from "./PreviewPage";
import { setCurrentTrack, setIsPlaying } from "../../redux/audioSlice";
import { Track } from "./types/ITrack";

const UserAlbumViewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const albumId = queryParams.get("albumId");
  const { userId } = useParams<{ userId: string }>();
  const [album, setAlbum] = useState<IAlbum | null>(null);
  const [songs, setSongs] = useState<ISong[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentTrack, isPlaying, isShuffled, isRepeating } = useSelector((state: RootState) => state.audio);
  const dispatch = useDispatch();

  const {
    handlePlay: baseHandlePlay,
    handleSkipBack,
    handleToggleShuffle,
    handleToggleRepeat,
    handleSkipForward,
  } = useAudioPlayback(songs as unknown as  Track[]);

  useEffect(() => {
    const fetchSongs = async () => {
      setIsLoading(true);
      try {
        if (!albumId) {
          toast.error("Invalid album ID.");
          return;
        }
        const songsData = await fetchAlbumSongs(albumId);
        setAlbum(songsData);
        setSongs(songsData.tracks || []);
      } catch (error: any) {
        toast.error(error.message || "Error fetching songs. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongs();
  }, [albumId]);

  const togglePlay = (song: ISong) => {
    if (currentTrack?._id === song._id && isPlaying) {
      audio.pause();
      dispatch(setIsPlaying(false));
    } else {
      audio.pause(); // Pause any existing playback
      audio.src = song.fileUrl;
      audio.play().catch((error) => {
        toast.error("Error playing song: " + error.message);
      });
      dispatch(setCurrentTrack({ ...song, album: album?.name } as unknown as Track));
      dispatch(setIsPlaying(true));
    }
  };

  const handlePlay = (track: Track) => {
    baseHandlePlay(track);
    dispatch(setCurrentTrack(track));
    dispatch(setIsPlaying(true));
  };

  const handlePlayFromModal = (track: Track) => {
    handlePlay(track);
  };

  const toggleModal = () => {
    setIsModalOpen((prev) => !prev);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleShare = () => {
    const albumUrl = `${window.location.origin}/albumView?albumId=${albumId}`;
    const shareMessage = `Check out this album: ${albumUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}
        <main className="flex-1 md:ml-[240px] px-4 sm:px-6 py-4 sm:py-7 pb-20 max-w-7xl mx-auto">
          {/* Breadcrumb Navigation (Mobile) */}
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
            <span className="mx-2">/</span>
            <a
              href="/albums"
              className="hover:text-white transition-colors"
              onClick={(e) => {
                e.preventDefault();
                navigate(`/user/${userId}/albums`);
              }}
            >
              Albums
            </a>
            <span className="mx-2">/</span>
            <span className="text-white">{album?.name || "Album"}</span>
          </nav>

          {/* Hero Section */}
          {album && (
            <section
              className="relative mb-8 rounded-xl overflow-hidden bg-gray-900 animate-fade-in"
              style={
                album.coverImage
                  ? {
                      backgroundImage: `url(${album.coverImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }
                  : {}
              }
              role="banner"
              aria-label={`Album ${album.name}`}
            >
              <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-md"></div>
              <div className="relative flex flex-col sm:flex-row items-center sm:items-start p-6 sm:p-8">
                {album.coverImage ? (
                  <img
                    src={album.coverImage}
                    alt={`${album.name} cover`}
                    className="w-48 h-48 sm:w-64 sm:h-64 object-cover rounded-lg shadow-xl transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-48 h-48 sm:w-64 sm:h-64 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 shadow-xl">
                    No Cover
                  </div>
                )}
                <div className="mt-4 sm:mt-0 sm:ml-8 flex flex-col justify-center">
                  <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                    {album.name}
                  </h1>
                  {album.description && (
                    <p className="mt-3 text-base text-gray-300 max-w-md">
                      {album.description}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-gray-400">
                    {songs.length} {songs.length === 1 ? "song" : "songs"}
                  </p>
                  <div className="mt-6 flex items-center gap-4">
                    <Button
                      className="bg-gold-400 text-navy-900 hover:bg-gold-500 font-semibold px-6 py-3 shadow-xl hover:shadow-2xl transition-all duration-300"
                      onClick={() => {
                        if (songs[0]) togglePlay(songs[0]);
                      }}
                      aria-label={`Play album ${album.name}`}
                    >
                      <Play className="h-5 w-5 mr-2" /> Play Album
                    </Button>
                    <Button
                      className="border-gold-400 text-gold-400 hover:bg-gold-400 hover:text-navy-900 font-semibold px-6 py-3 shadow-xl hover:shadow-2xl transition-all duration-300"
                      onClick={handleBack}
                      aria-label="Go back to previous page"
                    >
                      <ArrowLeft className="h-5 w-5 mr-2" /> Back
                    </Button>
                    <Button
                      className="border-gold-400 text-gold-400 hover:bg-gold-400 hover:text-navy-900 font-semibold px-6 py-3 shadow-xl hover:shadow-2xl transition-all duration-300"
                      onClick={handleShare}
                      aria-label="Share album"
                    >
                      <Share2 className="h-5 w-5 mr-2" /> Share
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Songs Section */}
          <Card className="p-6 bg-gray-900/50 backdrop-blur-sm border-gray-800 rounded-xl">
            <h2 className="text-2xl font-semibold mb-6">Tracks</h2>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2 text-gray-300">Loading songs...</span>
              </div>
            ) : songs.length === 0 ? (
              <p className="text-gray-300 text-center py-4">No songs in this album yet.</p>
            ) : (
              <div
                role="list"
                aria-label="List of songs in album"
                className="space-y-2 animate-fade-in"
              >
                {songs.map((song, index) => (
                  <div
                    key={song._id}
                    role="listitem"
                    className={cn(
                      "flex items-center bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/80 transition-all duration-300 group",
                      currentTrack?._id === song._id && isPlaying && "ring-2 ring-gold-400"
                    )}
                  >
                    <span className="w-8 text-sm text-gray-400 font-medium">
                      {index + 1}
                    </span>
                    <div className="w-12 h-12 bg-gray-700 rounded-md overflow-hidden mr-4 relative">
                      {song.img ? (
                        <img
                          src={song.img}
                          alt={`${song.title} cover`}
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-50"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Cover
                        </div>
                      )}
                      <button
                        className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md"
                        onClick={() => togglePlay(song)}
                        aria-label={
                          currentTrack?._id === song._id && isPlaying
                            ? `Pause ${song.title}`
                            : `Play ${song.title}`
                        }
                      >
                        {currentTrack?._id === song._id && isPlaying ? (
                          <Pause className="h-6 w-6 text-white" />
                        ) : (
                          <Play className="h-6 w-6 text-white" />
                        )}
                      </button>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold truncate">{song.title}</h3>
                      <p className="text-sm text-gray-300 truncate">{song.artists.join(", ")}</p>
                      <p className="text-xs text-gray-400">{song.genre.join(", ")}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "text-gold-400 hover:text-gold-500",
                        currentTrack?._id === song._id && isPlaying && "text-gold-500"
                      )}
                      onClick={() => togglePlay(song)}
                      aria-label={
                        currentTrack?._id === song._id && isPlaying
                          ? `Pause ${song.title}`
                          : `Play ${song.title}`
                      }
                    >
                      {currentTrack?._id === song._id && isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </main>
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
            toggleModal={toggleModal}
          />
        )}
        {currentTrack && (
          <PreviewModal
            track={currentTrack}
            isOpen={isModalOpen}
            toggleModal={toggleModal}
            onPlayTrack={handlePlayFromModal}
          />
        )}
      </div>
    </div>
  );
};

export default UserAlbumViewPage;