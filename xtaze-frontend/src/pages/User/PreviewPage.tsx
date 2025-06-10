import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minimize2, Maximize2, ListMusic, Info, Music, Play } from "lucide-react";
import { Track } from "./types/ITrack";
import { fetchAllTrack } from "../../services/userService";

interface PreviewModalProps {
  track: Track;
  isOpen: boolean;
  toggleModal: () => void;
  onPlayTrack: (track: Track) => void;
}

interface QueueTrack {
  id: string;
  title: string;
  artists: string | string[];
  fileUrl: string;
  img?: string;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ track, isOpen, toggleModal, onPlayTrack }) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<"queue" | "suggested" | "credits">("queue");
  const [playQueue, setPlayQueue] = React.useState<QueueTrack[]>([]);
  const [allTracks, setAllTracks] = React.useState<Track[]>([]);
  const [suggestedTracks, setSuggestedTracks] = React.useState<Track[]>([]);
  const [loadingTracks, setLoadingTracks] = React.useState(false);

  React.useEffect(() => {
    const storedQueue = JSON.parse(localStorage.getItem("playQueue") || "[]");
    setPlayQueue(storedQueue);
  }, [isOpen]);

  React.useEffect(() => {
    if (isOpen) {
      const loadAllTracks = async () => {
        setLoadingTracks(true);
        try {
          const tracks = await fetchAllTrack();
          setAllTracks(tracks);
        } catch (error) {
          console.error("Failed to fetch all tracks:", error);
          setAllTracks([]);
        } finally {
          setLoadingTracks(false);
        }
      };
      loadAllTracks();
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (viewMode === "suggested" && allTracks.length > 0) {
      const currentGenres = Array.isArray(track.genre) ? track.genre : track.genre ? [track.genre] : [];
      if (currentGenres.length > 0) {
        const filteredTracks = allTracks
          .filter((t) => {
            const trackGenres = Array.isArray(t.genre) ? t.genre : t.genre ? [t.genre] : [];
            return (
              t._id !== track._id &&
              trackGenres.some((genre) => currentGenres.includes(genre))
            );
          })
          .slice(0, 5);
        setSuggestedTracks(filteredTracks);
      } else {
        setSuggestedTracks([]);
      }
    } else if (viewMode === "suggested" && allTracks.length === 0) {
      setSuggestedTracks([]);
    }
  }, [viewMode, allTracks, track.genre, track._id]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const removeFromQueue = (trackId: string) => {
    const updatedQueue = playQueue.filter((q) => q.id !== trackId);
    setPlayQueue(updatedQueue);
    localStorage.setItem("playQueue", JSON.stringify(updatedQueue));
  };

  const handlePlayTrack = (selectedTrack: Track) => {
    onPlayTrack(selectedTrack);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed inset-x-0 top-0 h-[calc(100vh-60px)] sm:h-[calc(100vh-80px)] flex items-center justify-center bg-black/80 z-50"
        >
          <div className="w-full h-full max-w-4xl sm:max-w-none bg-zinc-900 text-white shadow-lg overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 bg-zinc-900">
              <h2 className="text-base sm:text-lg font-bold"></h2>
              <div className="flex gap-2">
                <button
                  className="p-3 sm:p-2 rounded-md bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-600"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-5 w-5 sm:h-4 sm:w-4 text-white" />
                  ) : (
                    <Maximize2 className="h-5 w-5 sm:h-4 sm:w-4 text-white" />
                  )}
                </button>
                <button
                  className="p-3 sm:p-2 rounded-md bg-red-600 hover:bg-red-500 active:bg-red-500"
                  onClick={toggleModal}
                >
                  <X className="h-5 w-5 sm:h-4 sm:w-4 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col sm:flex flex-1 p-4 sm:p-6 gap-4 sm:gap-6 overflow-y-auto pb-16 sm:pb-20">
              {/* Artwork */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative w-[240px] h-[240px] sm:w-[400px] sm:h-[400px] flex items-center justify-center">
                  <div
                    className="absolute inset-0 bg-zinc-900 shadow-lg filter blur-xl sm:blur-2xl"
                    style={{
                      backgroundImage: `url(${track.img || "/default-track.jpg"})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                  <img
                    src={track.img || "/default-track.jpg"}
                    alt="Track artwork"
                    className="relative w-[200px] h-[200px] sm:w-[360px] sm:h-[360px] object-cover rounded-lg shadow-lg z-10"
                  />
                </div>
                <div className="mt-2 sm:mt-4 text-center">
                  <h3 className="text-base sm:text-2xl font-bold truncate">{track.title}</h3>
                  <p className="text-zinc-400 text-xs sm:text-sm truncate">
                    {Array.isArray(track.artists) ? track.artists.join(", ") : track.artists}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex-1 rounded-lg p-4 sm:p-6">
                <div className="flex flex-wrap items-center gap-4 sm:gap-10 mb-4 sm:mb-6">
                  <button
                    className={`flex items-center gap-2 bg-zinc-800 p-3 sm:p-4 w-32 sm:w-40 rounded-md hover:bg-zinc-700 active:bg-zinc-700 text-sm sm:text-base ${viewMode === "queue" ? "bg-zinc-700" : ""}`}
                    onClick={() => setViewMode("queue")}
                  >
                    <ListMusic className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    Play Queue
                  </button>
                  <button
                    className={`flex items-center gap-2 bg-zinc-800 p-3 sm:p-4 w-32 sm:w-40 rounded-md hover:bg-zinc-700 active:bg-zinc-700 text-sm sm:text-base ${viewMode === "suggested" ? "bg-zinc-700" : ""}`}
                    onClick={() => setViewMode("suggested")}
                  >
                    <Music className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    Recommended
                  </button>
                  <button
                    className={`flex items-center gap-2 bg-zinc-800 p-3 sm:p-4 w-32 sm:w-40 rounded-md hover:bg-zinc-700 active:bg-zinc-700 text-sm sm:text-base ${viewMode === "credits" ? "bg-zinc-700" : ""}`}
                    onClick={() => setViewMode("credits")}
                  >
                    <Info className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    Credits
                  </button>
                </div>

                {/* Conditional Rendering */}
                {viewMode === "credits" ? (
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-xl font-semibold">Credits</h3>
                    <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                      <p>
                        <span className="text-zinc-400">Song Name: </span>
                        {track.title}
                      </p>
                      <p>
                        <span className="text-zinc-400">Artists: </span>
                        {Array.isArray(track.artists) ? track.artists.join(", ") : track.artists}
                      </p>
                      <p>
                        <span className="text-zinc-400">Genre: </span>
                        {track.genre || "Unknown Genre"}
                      </p>
                      <p>
                        <span className="text-zinc-400">Year of Publish: </span>
                        2023
                      </p>
                    </div>
                  </div>
                ) : viewMode === "suggested" ? (
                  <div className="space-y-2 sm:space-y-1">
                    <h3 className="text-base sm:text-xl font-semibold mb-2 sm:mb-3">Suggested Tracks</h3>
                    {loadingTracks ? (
                      <p className="text-zinc-400 text-sm sm:text-base">Loading tracks...</p>
                    ) : suggestedTracks.length > 0 ? (
                      suggestedTracks.map((suggestedTrack) => (
                        <div
                          key={suggestedTrack._id}
                          className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-zinc-700 active:bg-zinc-700 rounded-lg cursor-pointer group"
                        >
                          <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-zinc-800 rounded">
                            <img
                              src={suggestedTrack.img || "/default-track.jpg"}
                              alt={suggestedTrack.title}
                              className="w-full h-full rounded object-cover shadow-md"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/70 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity rounded">
                              <button
                                onClick={() => handlePlayTrack(suggestedTrack)}
                              >
                                <Play className="h-5 w-5 sm:h-4 sm:w-4 text-white" />
                              </button>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base truncate">{suggestedTrack.title}</p>
                            <p className="text-xs sm:text-sm text-zinc-400 truncate">
                              {Array.isArray(suggestedTrack.artists)
                                ? suggestedTrack.artists.join(", ")
                                : suggestedTrack.artists}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-zinc-400 text-sm sm:text-base">
                        No suggested tracks found for genre "{Array.isArray(track.genre) ? track.genre.join(", ") : track.genre || "Unknown"}".
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-1">
                    <h3 className="text-base sm:text-xl font-semibold mb-2 sm:mb-3">Play Queue</h3>
                    {playQueue.length > 0 ? (
                      playQueue.map((queueTrack) => (
                        <div
                          key={queueTrack.id}
                          className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-zinc-700 active:bg-zinc-700 rounded-lg cursor-pointer"
                        >
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-zinc-800 rounded">
                            <img
                              src={queueTrack.img || "/default-track.jpg"}
                              alt={queueTrack.title}
                              className="w-full h-full rounded object-cover shadow-md"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base truncate">{queueTrack.title}</p>
                            <p className="text-xs sm:text-sm text-zinc-400 truncate">
                              {Array.isArray(queueTrack.artists)
                                ? queueTrack.artists.join(", ")
                                : queueTrack.artists}
                            </p>
                          </div>
                          <button
                            className="p-2 sm:p-3 rounded-md hover:bg-zinc-600 active:bg-zinc-600"
                            onClick={() => removeFromQueue(queueTrack.id)}
                          >
                            <X className="h-5 w-5 sm:h-4 sm:w-4 text-white" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-zinc-400 text-sm sm:text-base">No songs in queue. Add some tracks!</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PreviewModal;