import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import Sidebar from "./userComponents/SideBar";
import { toast } from "sonner";
import { Play, Pause, ArrowLeft, Share2 } from "lucide-react";
import { cn } from "../../../lib/utils";
import { IAlbum, ISong } from "../User/types/IAlbums";
import { fetchAlbumSongs } from "../../services/userService";

const UserAlbumViewPage = () => {
  const navigate = useNavigate();
  const [album, setAlbum] = useState<IAlbum | null>(null);
  const [songs, setSongs] = useState<ISong[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});
 const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const albumId = queryParams.get("albumId");
  useEffect(() => {
    const fetchSongs = async () => {


      setIsLoading(true);
      try {
        console.log(albumId,"sssssssss")
        if (!albumId) {
          toast.error("Invalid album ID.");
          setIsLoading(false);
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

  const togglePlay = (songId: string, fileUrl: string) => {
    const audio = audioRefs.current[songId];
    if (!audio) return;

    Object.keys(audioRefs.current).forEach((id) => {
      if (id !== songId && audioRefs.current[id]) {
        audioRefs.current[id]!.pause();
      }
    });

    if (currentPlayingId === songId) {
      audio.pause();
      setCurrentPlayingId(null);
    } else {
      audio.src = fileUrl;
      audio.play().catch((error) => {
        toast.error("Error playing song: " + error.message);
      });
      setCurrentPlayingId(songId);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleShare = () => {
    const albumUrl = `${window.location.origin}/albumView?=${albumId}`;
    const shareMessage = `Check out this album: ${albumUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-black/50 text-white font-sans px-4">
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}
        <main className="flex-1 md:ml-[240px] px-4 sm:px-6 py-4 sm:py-7">
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
                    className="w-48 h-48 sm:w-64 sm:h-64 object-cover rounded-lg shadow-xl"
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
                  <div className="mt-6 flex items-center gap-4">
                    <Button
                      className="bg-gold-400 text-navy-900 hover:bg-gold-500 font-semibold px-6 py-3 shadow-xl hover:shadow-2xl transition-all duration-300"
                      onClick={() => {
                        if (songs[0]) togglePlay(songs[0]._id, songs[0].fileUrl);
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
          <Card className="p-6 bg-gray-900/50 backdrop-blur-sm border-gray-800">
            <h2 className="text-2xl font-semibold mb-6">Tracks</h2>
            {isLoading ? (
              <p className="text-gray-300">Loading songs...</p>
            ) : songs.length === 0 ? (
              <p className="text-gray-300">No songs in this album yet.</p>
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
                      "flex items-center bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/80 transition-all duration-300",
                      currentPlayingId === song._id && "ring-2 ring-gold-400"
                    )}
                  >
                    <span className="w-8 text-sm text-gray-400 font-medium">
                      {index + 1}
                    </span>
                    <div className="w-12 h-12 bg-gray-700 rounded-md overflow-hidden mr-4">
                      {song.img ? (
                        <img
                          src={song.img}
                          alt={`${song.title} cover`}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Cover
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold truncate">
                        {song.title}
                      </h3>
                      <p className="text-sm text-gray-300 truncate">
                        {song.artists.join(", ")}
                      </p>
                      <p className="text-xs text-gray-400">
                        {song.genre.join(", ")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "text-gold-400 hover:text-gold-500",
                        currentPlayingId === song._id && "text-gold-500"
                      )}
                      onClick={() => togglePlay(song._id, song.fileUrl)}
                      aria-label={
                        currentPlayingId === song._id
                          ? `Pause ${song.title}`
                          : `Play ${song.title}`
                      }
                    >
                      {currentPlayingId === song._id ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </Button>
                    <audio
                      ref={(el) => (audioRefs.current[song._id] = el)}
                      className="hidden"
                      onEnded={() => setCurrentPlayingId(null)}
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
};

export default UserAlbumViewPage;