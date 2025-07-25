import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import Sidebar from "./userComponents/SideBar";
import { toast } from "sonner";
import { getMyAlbums } from "../../services/userService";
import { ArrowLeft, Play } from "lucide-react";
import { cn } from "../../../lib/utils";
import { IAlbum } from "../User/types/IAlbums";

const UserAlbumsListPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [albums, setAlbums] = useState<IAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const token = localStorage.getItem("userToken");

  useEffect(() => {
    const fetchAlbums = async () => {
      if (!token || !userId) {
        toast.error("Please log in to view albums.");
        return;
      }

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
  }, [userId, token]);

  const handleBack = () => {
    navigate(-1);
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
        <main className="flex-1 md:ml-[240px] px-4 sm:px-6 py-4 sm:py-7 max-w-7xl mx-auto">
          {/* Hero Section */}
          <section className="relative mb-8 rounded-xl overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900 animate-fade-in">
            <div className="p-6 sm:p-8">
              <Button
                className="mb-4 bg-gold-400 text-navy-900 hover:bg-gold-500 font-semibold px-4 py-2 shadow-xl hover:shadow-2xl transition-all duration-300"
                onClick={handleBack}
                aria-label="Go back to previous page"
              >
                <ArrowLeft className="h-5 w-5 mr-2" /> Back
              </Button>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                Your Albums
              </h1>
              <p className="mt-2 text-base text-gray-300 max-w-md">
                Explore your collection of albums.
              </p>
            </div>
          </section>

          {/* Albums Grid */}
          <Card className="p-6 bg-gray-900/50 backdrop-blur-sm border-gray-800">
            <h2 className="text-2xl font-semibold mb-6">All Albums</h2>
            {isLoading ? (
              <p className="text-gray-300">Loading albums...</p>
            ) : albums.length === 0 ? (
              <p className="text-gray-300">No albums found.</p>
            ) : (
              <div
                role="list"
                aria-label="List of albums"
                className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-fade-in"
              >
                {albums.map((album, index) => (
                  <Card
                    key={album._id}
                    className={cn(
                      "relative bg-gray-800/50 border-gray-700 rounded-lg p-4 hover:bg-gray-800/80 hover:-translate-y-1 transition-all duration-300 cursor-pointer group",
                      "shadow-xl hover:shadow-2xl"
                    )}
                    role="listitem"
                    aria-label={`View album ${album.name}`}
                    onClick={() => navigate(`/user/${userId}/albums/${album._id}/songs`)}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-full h-48 bg-gray-700 rounded-md overflow-hidden mb-3 relative">
                      {album.coverImage ? (
                        <img
                          src={album.coverImage}
                          alt={`${album.name} cover`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Cover
                        </div>
                      )}
                      <Button
                        className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-gold-400/80 text-navy-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        aria-label={`Play album ${album.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Placeholder: Play first song (requires fetch)
                          toast.info("Play album feature coming soon!");
                        }}
                      >
                        <Play className="h-6 w-6" />
                      </Button>
                    </div>
                    <h3 className="text-lg font-semibold truncate">{album.name}</h3>
                    <p className="text-sm text-gray-300 truncate">
                      {album.description || "No description"}
                    </p>
                    {album.tracks && (
                      <p className="text-xs text-gray-400 mt-1">
                        {album.tracks.length} {album.tracks.length === 1 ? "song" : "songs"}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
};

export default UserAlbumsListPage;