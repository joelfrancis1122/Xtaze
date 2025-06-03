
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minimize2, Maximize2, ListMusic, Info, Music, Play } from "lucide-react";
import { Track } from "./types/ITrack";
import { fetchAllTrack } from "../../services/userService";

interface PreviewModalProps {
  track: Track;
  isOpen: boolean;
  toggleModal: () => void;
  onPlayTrack: (track: Track) => void; // Added callback for playing tracks
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

  // Sync cheyan with localStorage
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
          console.log(tracks, "Fetched all tracks");
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

  // recomended sthalam
  React.useEffect(() => {
    if (viewMode === "suggested" && allTracks.length > 0) {
      const currentGenres = Array.isArray(track.genre) ? track.genre : track.genre ? [track.genre] : [];
      if (currentGenres.length > 0) {
        const filteredTracks = allTracks
          .filter((t) => {
            const trackGenres = Array.isArray(t.genre) ? t.genre : t.genre ? [t.genre] : [];
            return (
              t._id !== track._id && //  without current track 
              trackGenres.some((genre) => currentGenres.includes(genre)) // Match any 
            );
          })
          .slice(0, 5); // Limit to 5
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
    onPlayTrack(selectedTrack); // Trigger playback in parent
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed inset-x-0 top-0 h-[calc(100vh-80px)] flex items-center justify-center bg-black/80 z-50"
        >
          <div className="w-full h-full max-w-none bg-zinc-900 text-white shadow-lg overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-zinc-900">
              <h2 className="text-lg font-bold"></h2>
              <div className="flex gap-2">
                <button
                  className="p-2 rounded-md bg-zinc-700 hover:bg-zinc-600"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4 text-white" />
                  ) : (
                    <Maximize2 className="h-4 w-4 text-white" />
                  )}
                </button>
                <button
                  className="p-2 rounded-md bg-red-600 hover:bg-red-500"
                  onClick={toggleModal}
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 p-6 gap-6 overflow-y-auto">
              {/* Left side - Artwork */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative w-[400px] h-[400px] flex items-center justify-center">
                  <div
                    className="absolute inset-0 bg-zinc-900 shadow-lg filter blur-2xl"
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
                    className="relative w-[360px] h-[360px] object-cover rounded-lg shadow-lg z-10"
                  />
                </div>
                <div className="mt-4 text-center">
                  <h3 className="text-2xl font-bold">{track.title}</h3>
                  <p className="text-zinc-400">
                    {Array.isArray(track.artists) ? track.artists.join(", ") : track.artists}
                  </p>
                </div>
              </div>

              {/* Right side - Buttons & Queue/Suggested/Credits */}
              <div className="flex-1 rounded-lg p-21 transform translate-x-[-140px] translate-y-[5px]">
                <div className="flex items-center gap-10 mb-4">
                  <button
                    className={`flex items-center gap-2 bg-zinc-800 p-4 w-40 rounded-md hover:bg-zinc-700 ${viewMode === "queue" ? "bg-zinc-700" : ""
                      }`}
                    onClick={() => setViewMode("queue")}
                  >
                    <ListMusic className="h-5 w-5 text-white" />
                    Play Queue
                  </button>
                  <button
                    className={`flex items-center gap-2 bg-zinc-800 p-4 w-40 rounded-md hover:bg-zinc-700 ${viewMode === "suggested" ? "bg-zinc-700" : ""
                      }`}
                    onClick={() => setViewMode("suggested")}
                  >
                    <Music className="h-5 w-5 text-white" />
                    Recomended                  </button>
                  <button
                    className={`flex items-center gap-2 bg-zinc-800 p-4 w-40 rounded-md hover:bg-zinc-700 ${viewMode === "credits" ? "bg-zinc-700" : ""
                      }`}
                    onClick={() => setViewMode("credits")}
                  >
                    <Info className="h-5 w-5 text-white" />
                    Credits
                  </button>
                </div>

                {/* Conditional Rendering */}
                {viewMode === "credits" ? (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Credits</h3>
                    <div className="space-y-2">
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
                  <div className="space-y-1 mt-auto">
                    <h3 className="text-xl font-semibold mb-2">Suggested Tracks</h3>
                    {loadingTracks ? (
                      <p className="text-zinc-400">Loading tracks...</p>
                    ) : suggestedTracks.length > 0 ? (
                      suggestedTracks.map((suggestedTrack) => (
                        <div
                          key={suggestedTrack._id}
                          className="flex items-center gap-3 p-2 hover:bg-zinc-700 rounded-lg cursor-pointer group"
                        >
                          <div className="relative w-20 h-20 bg-zinc-800 rounded">
                            <img
                              src={suggestedTrack.img || "/default-track.jpg"}
                              alt={suggestedTrack.title}
                              className="w-full h-full rounded object-cover shadow-md"
                            />
                            {/* Overlay and Play Button */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                              <button
                                onClick={() => handlePlayTrack(suggestedTrack)}
                              >
                                <Play className="h-4 w-4 text-white" />
                              </button>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate">{suggestedTrack.title}</p>
                            <p className="text-sm text-zinc-400 truncate">
                              {Array.isArray(suggestedTrack.artists)
                                ? suggestedTrack.artists.join(", ")
                                : suggestedTrack.artists}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-zinc-400">
                        No suggested tracks found for genre "{Array.isArray(track.genre) ? track.genre.join(", ") : track.genre || "Unknown"}".
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1 mt-auto">
                    <h3 className="text-xl font-semibold mb-2">Play Queue</h3>
                    {playQueue.length > 0 ? (
                      playQueue.map((queueTrack) => (
                        <div
                          key={queueTrack.id}
                          className="flex items-center gap-3 p-2 hover:bg-zinc-700 rounded-lg cursor-pointer"
                        >
                          <div className="w-20 h-20 bg-zinc-800 rounded">
                            <img
                              src={queueTrack.img || "/default-track.jpg"}
                              alt={queueTrack.title}
                              className="w-full h-full rounded object-cover shadow-md"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate">{queueTrack.title}</p>
                            <p className="text-sm text-zinc-400 truncate">
                              {Array.isArray(queueTrack.artists)
                                ? queueTrack.artists.join(", ")
                                : queueTrack.artists}
                            </p>
                          </div>
                          <button
                            className="p-2 rounded-md hover:bg-zinc-600"
                            onClick={() => removeFromQueue(queueTrack.id)}
                          >
                            <X className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-zinc-400">No songs in queue. Add some tracks!</p>
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