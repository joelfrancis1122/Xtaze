import { useEffect, useState } from "react";
import Sidebar from "./userComponents/SideBar";
import { fetchArtists } from "../../services/userService";
import { useNavigate } from "react-router-dom";
import MusicPlayer from "./userComponents/TrackBar";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import PreviewModal from "./PreviewPage";
import { useAudioPlayback } from "./userComponents/audioPlayback";
import { audio } from "../../utils/audio";
import { Track } from "./types/ITrack";

interface Artist {
  id: string;
  name: string;
  role: string;
  image: string;
  isActive: boolean;
}

export default function ArtistPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();
  const { currentTrack, isPlaying, isShuffled, isRepeating } = useSelector((state: RootState) => state.audio);
  const { handlePlay: baseHandlePlay, handleSkipBack, handleSkipForward, handleToggleShuffle, handleToggleRepeat } =
    useAudioPlayback([]);

  const toggleModal = () => {
    setIsModalOpen((prevState) => !prevState);
  };

  const handlePlayFromModal = (track: Track) => {
    baseHandlePlay(track);
  };

  useEffect(() => {
    const loadArtists = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token") || "";
        const allArtists = await fetchArtists(token);
        const artistList = allArtists.filter((artist: Artist) => artist.role === "artist");
        setArtists(artistList);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching artists:", err.message);
        setError("Failed to load artists");
      } finally {
        setLoading(false);
      }
    };

    loadArtists();
  }, []);

  return (
    <div className="flex h-screen flex-col bg-black text-white">
      <div className="flex flex-1">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}
        <main className="flex-1 min-h-screen md:ml-[240px] bg-black overflow-y-auto">
          <section className="px-4 sm:px-6 py-4 sm:py-6 pb-20">
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
              <span className="mx-2"></span>
              <span className="text-white">Artists</span>
            </nav>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Artists</h2>
            {loading ? (
              <div className="text-center py-3 sm:py-4 text-sm sm:text-base text-gray-400">
                Loading artists...
              </div>
            ) : error ? (
              <div className="text-red-400 text-center py-3 sm:py-4 text-sm sm:text-base">
                {error}
              </div>
            ) : artists.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 overflow-hidden">
                {artists.map((artist) => (
                  <div
                    key={artist.id}
                    className="bg-[#1d1d1d] rounded-lg p-3 sm:p-4 hover:bg-[#242424] active:bg-[#242424] transition-colors duration-200 flex flex-col items-center box-content"
                  >
                    <img
                      src={artist.image || "/default-image.png"}
                      alt={artist.name}
                      className="w-24 sm:w-32 h-24 sm:h-32 object-cover rounded-full mb-2 cursor-pointer"
                      onClick={() => navigate(`/artists/${artist.id}`)}
                    />
                    <div className="text-white font-semibold truncate text-center text-sm sm:text-base">
                      {artist.name}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-3 sm:py-4 text-sm sm:text-base">
                No artists found.
              </div>
            )}
          </section>
        </main>
      </div>
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
  );
}