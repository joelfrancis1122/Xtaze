import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import Sidebar from "./userComponents/SideBar";
import { toast } from "sonner";
import { getMyAlbums } from "../../services/userService";
import { ArrowLeft } from "lucide-react";
import { IAlbum } from "../User/types/IAlbums";
import MusicPlayer from "./userComponents/TrackBar";
import PreviewModal from "./PreviewPage";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Track } from "./types/ITrack";
import { useAudioPlayback } from "./userComponents/audioPlayback";
import { audio } from "../../utils/audio";
import { setCurrentTrack, setIsPlaying } from "../../redux/audioSlice";

const AlbumList = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [albums, setAlbums] = useState<IAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentTrack, isPlaying, isShuffled, isRepeating } = useSelector((state: RootState) => state.audio);
  const dispatch = useDispatch();
    const handlePlay = (track: Track) => {
      baseHandlePlay(track);
      dispatch(setCurrentTrack(track));
      dispatch(setIsPlaying(true));
    };
  
const toggleModal = () => {
    setIsModalOpen((prev) => !prev);
  };
  const handlePlayFromModal = (track: Track) => {
    handlePlay(track);
  };

  const {
    handlePlay: baseHandlePlay,
    handleSkipBack,
    handleToggleShuffle,
    handleToggleRepeat,
    handleSkipForward,
  } = useAudioPlayback(currentTrack as unknown as Track[]);

  useEffect(() => {
    const fetchAlbums = async () => {


      setIsLoading(true);
      try {
        const albumsData = await getMyAlbums();
        setAlbums(albumsData || []);
      } catch (error: any) {
        toast.error(error.message || "Error fetching albums. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlbums();
  }, [userId]);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans px-4">
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}
        <main className="flex-1 md:ml-[240px] px-4 sm:px-6 py-4 sm:py-7">
          <Button
            className="mb-6 bg-gold-400 text-navy-900 hover:bg-gold-500 font-semibold px-4 py-2 shadow-xl hover:shadow-2xl transition-all duration-300"
            onClick={handleBack}
            aria-label="Go back to previous page"
          >
            <ArrowLeft className="h-5 w-5 mr-2" /> Back
          </Button>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-6 animate-fade-in">
            All Albums
          </h1>
          {isLoading ? (
            <p className="text-gray-300">Loading albums...</p>
          ) : albums.length === 0 ? (
            <p className="text-gray-300">No albums found.</p>
          ) : (
            <div
              role="list"
              aria-label="List of albums"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in"
            >
              {albums.map((album) => (
                <Card
                  key={album._id}
                  className="bg-gray-800/50 border-gray-700 rounded-lg p-4 hover:bg-gray-800/80 transition-all duration-300 cursor-pointer"
                  role="listitem"
                  onClick={() => navigate(`/albumView?albumId=${album._id}`)}
                >
                  <div className="w-full h-40 bg-gray-700 rounded-md overflow-hidden mb-3">
                    {album.coverImage ? (
                      <img  
                        src={album.coverImage}
                        alt={`${album.name} cover`}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Cover
                      </div>
                    )}
                  </div>
                  <h3 className="text-base font-semibold truncate">{album.name}</h3>
                  <p className="text-sm text-gray-300 truncate">
                    {album.description || "No description"}
                  </p>
                </Card>
              ))}
            </div>
          )}
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

export default AlbumList;

