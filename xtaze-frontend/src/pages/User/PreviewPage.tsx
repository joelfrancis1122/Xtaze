import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minimize2, Maximize2, ListMusic, Info, Music } from "lucide-react";
import { Track } from "./types/ITrack";
import { fetchAllTrack } from "../../services/userService";
import { WavyBackground } from "../../components/ui/wavy-background";

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

const genreColors: Record<string, string> = {
  pop: "from-purple-900/40 to-fuchsia-800/10",
  Pop: "from-purple-900/40 to-fuchsia-800/10",
  Rock: "from-red-900/40 to-rose-800/10",
  Films: "from-black/95 via-purple-900/70 to-black/90",
  HipHop: "from-yellow-900/40 to-amber-800/10",
  EDM: "from-cyan-900/40 to-teal-800/10",
  alternative: "from-emerald-900/40 to-green-800/10",
  Default: "from-[#1a1a1a] to-[#0f0f0f]",
};

const PreviewModal: React.FC<PreviewModalProps> = ({
  track,
  isOpen,
  toggleModal,
  onPlayTrack,
}) => {
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
    console.log(track, "sss");
    if (viewMode === "suggested" && allTracks.length > 0) {
      const currentGenres = Array.isArray(track.genre)
        ? track.genre
        : track.genre
        ? [track.genre]
        : [];
      if (currentGenres.length > 0) {
        const filteredTracks = allTracks
          .filter((t) => {
            const trackGenres = Array.isArray(t.genre)
              ? t.genre
              : t.genre
              ? [t.genre]
              : [];
            return (
              t.id !== track.id &&
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
  }, [viewMode, allTracks, track.genre, track.id]);

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

  const genreGradient =
    (Array.isArray(track.genre) && genreColors[track.genre[0]]) ||
    genreColors[track.genre as string] ||
    genreColors.Default;
  const isFilmsGenre = track.genre === "Films" || (Array.isArray(track.genre) && track.genre.includes("Films"));

  const ModalContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-8 py-2 md:py-3 bg-transparent">
        <div className="flex gap-2 md:gap-3">
          <button
            className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-[#2a2a2a]/80 hover:bg-[#3a3a3a] text-xs md:text-sm font-medium shadow-lg"
            onClick={toggleModal}
          >
            <Minimize2 size={14} className="md:w-4 md:h-4" /> Minimize
          </button>
          <button
            className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-[#2a2a2a]/80 hover:bg-[#3a3a3a] text-xs md:text-sm font-medium shadow-lg"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize2 size= {14} className="md:w-4 md:h-4" />
            ) : (
              <Maximize2 size={14} className="md:w-4 md:h-4" />
            )}
            Fullscreen
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col md:flex-row flex-1 overflow-y-auto overflow-x-hidden px-4 md:px-12 pb-10 gap-8 min-w-0">
        {/* Left - Artwork */}
        <div className="w-full md:w-[55%] flex flex-col items-center justify-start md:pr-12 mt-6 md:mt-20">
          {/* Artwork block */}
          <div className="relative flex items-center justify-center w-40 h-40 md:w-[410px] md:h-[400px] z-10 max-w-full">
            {/* Blurred glowing background */}
            <img
              src={track.img || "/default-track.jpg"}
              alt="Track blur bg"
              className="absolute inset-0 w-full h-full object-cover rounded-3xl blur-lg opacity-30 scale-125 shadow-[0_0_60px_rgba(0,0,0,0.6)]"
            />
            {/* Gradient overlay for smoother blend */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 via-transparent to-black/10 animate-gradient-slow" />
            {/* Main sharp image */}
            <img
              src={track.img || "/default-track.jpg"}
              alt="Track artwork"
              className="w-full h-full object-cover rounded-2xl shadow-2xl relative z-10 animate-gradient-slow"
            />
            {/* Overlay button */}
            <button className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 hover:opacity-100 transition z-20">
              <Info size={24} className="md:w-8 md:h-8" />
            </button>
          </div>
          {/* Title + Artists */}
          <div className="mt-4 md:mt-6 text-center relative z-20">
            <h3 className="text-lg md:text-3xl font-extrabold tracking-tight">
              {track.title}
            </h3>
            <p className="text-gray-300 text-sm md:text-lg mt-1">
              {Array.isArray(track.artists) ? track.artists.join(", ") : track.artists}
            </p>
          </div>
        </div>

        {/* Right - Queue/Suggested/Credits */}
        <div className="w-full md:w-[45%] pl-2 md:pl-6 flex flex-col mt-6 md:mt-20">
          {/* Tabs */}
          <div className="flex gap-2 md:gap-4 mb-4 md:mb-6">
            {[
              { id: "queue", label: "Play queue", icon: ListMusic },
              { id: "suggested", label: "Suggested", icon: Music },
              { id: "credits", label: "Credits", icon: Info },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setViewMode(tab.id as "queue" | "suggested" | "credits")}
                  className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-1.5 md:py-2.5 rounded-xl border text-xs md:text-sm font-medium transition shadow-md ${
                    viewMode === tab.id
                      ? "bg-white text-black border-white"
                      : "border-gray-600 text-gray-400 hover:text-white hover:border-white/60"
                  }`}
                >
                  <Icon size={14} className="md:w-4 md:h-4" /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* Queue */}
          {viewMode === "queue" && (
            <div className="space-y-2 md:space-y-3 overflow-y-auto pr-1 md:pr-2">
              {playQueue.length > 0 ? (
                playQueue.map((queueTrack) => (
                  <div
                    key={queueTrack.id}
                    className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 md:py-2 rounded-xl hover:bg-[#1f1f1f]/80 transition"
                    onClick={() => handlePlayTrack(queueTrack as any)}
                >
                    <img
                      src={queueTrack.img || "/default-track.jpg"}
                      alt={queueTrack.title}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs md:text-sm font-semibold text-white">
                        {queueTrack.title}
                      </p>
                      <p className="truncate text-[10px] md:text-xs text-gray-400">
                        {Array.isArray(queueTrack.artists)
                          ? queueTrack.artists.join(", ")
                          : queueTrack.artists}
                      </p>
                    </div>
                    <button
                      className="p-1 md:p-2 hover:bg-[#2a2a2a]/70 rounded-lg"
                      onClick={() => removeFromQueue(queueTrack.id)}
                    >
                      <X size={12} className="md:w-3.5 md:h-3.5 text-gray-300" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-xs md:text-sm">No songs in queue.</p>
              )}
            </div>
          )}

          {/* Suggested */}
          {viewMode === "suggested" && (
            <div className="space-y-2 md:space-y-3 overflow-y-auto pr-1 md:pr-2">
              {loadingTracks ? (
                <p className="text-gray-400 text-xs md:text-sm">Loading tracks...</p>
              ) : suggestedTracks.length > 0 ? (
                suggestedTracks.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 md:py-2 rounded-xl hover:bg-[#1f1f1f]/80 transition cursor-pointer"
                    onClick={() => handlePlayTrack(s)}
                  >
                    <img
                      src={s.img || "/default-track.jpg"}
                      alt={s.title}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs md:text-sm font-semibold text-white">
                        {s.title}
                      </p>
                      <p className="truncate text-[10px] md:text-xs text-gray-400">
                        {Array.isArray(s.artists)
                          ? s.artists.join(", ")
                          : s.artists}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-xs md:text-sm">No suggested tracks found.</p>
              )}
            </div>
          )}

          {/* Credits */}
          {viewMode === "credits" && (
            <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
              <h3 className="text-base md:text-lg font-semibold">Credits</h3>
              <p>
                <span className="text-gray-400">Song: </span>
                {track.title}
              </p>
              <p>
                <span className="text-gray-400">Artists: </span>
                {Array.isArray(track.artists)
                  ? track.artists.join(", ")
                  : track.artists}
              </p>
              <p>
                <span className="text-gray-400">Genre: </span>
                {track.genre || "Unknown"}
              </p>
              <p>
                <span className="text-gray-400">Album: </span>
                {typeof track.albumId === "object" && track.albumId !== null && "name" in track.albumId
                  ? (track.albumId as { name: string }).name
                  : track.albumId || "No Album"}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed inset-x-0 top-0 bottom-[80px] bg-black/95 z-50 overflow-x-hidden"
        >
          {isFilmsGenre ? (
            <WavyBackground
              className={`w-full h-full flex flex-col min-w-0 max-w-full overflow-x-hidden bg-gradient-to-b ${genreGradient}`}
            >
              {ModalContent}
            </WavyBackground>
          ) : (
            <div
              className={`w-full h-full flex flex-col min-w-0 max-w-full overflow-x-hidden bg-gradient-to-b ${genreGradient}`}
            >
              {ModalContent}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PreviewModal;