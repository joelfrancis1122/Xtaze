import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import { saveSignupData } from "../../redux/userSlice";
import { setCurrentTrack, setIsPlaying } from "../../redux/audioSlice";
import Sidebar from "./userComponents/SideBar";
import MusicPlayer from "./userComponents/TrackBar";
import PreviewModal from "./PreviewPage";
import { useParams } from "react-router-dom";
import { fetchArtistTracks, fetchUserByUsername, toggleLike, getMyplaylist, addTrackToPlaylist } from "../../services/userService";
import { Play, Pause, Plus, Heart, Download, ListMusic, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { audio } from "../../utils/audio";
import { Track } from "./types/ITrack";
import { useAudioPlayback } from "./userComponents/audioPlayback";
import { fetchAllArtistsVerification } from "../../services/userService";

interface Artist {
  id: string;
  name: string;
  role: string;
  profilePic: string;
  banner: string | null;
  isActive: boolean;
  bio?: string;
  verificationStatus: "pending" | "approved" | "rejected" | "unsubmitted";
}

const isVideo = (url: string) => {
  const videoExtensions = [".mp4", ".webm", ".ogg"];
  return videoExtensions.some((ext) => url.toLowerCase().endsWith(ext));
};

export default function ArtistDetailsPage() {
  const { artistId } = useParams<{ artistId: string }>();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set());
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [dropdownTrackId, setDropdownTrackId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    handlePlay: baseHandlePlay,
    handleSkipBack,
    handleToggleShuffle,
    handleToggleRepeat,
    handleSkipForward,
  } = useAudioPlayback(tracks);
  const handlePlayFromModal = (track: Track) => {
    handlePlay(track);
  };

  const { currentTrack, isPlaying, isShuffled, isRepeating } = useSelector((state: RootState) => state.audio);
  const user = useSelector((state: RootState) => state.user.signupData);
  const dispatch = useDispatch();

  useEffect(() => {
    const loadArtistDetails = async () => {
      if (!artistId) {
        setError("Artist ID is missing");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const token = localStorage.getItem("token") || "";
        const fetchedTracks = await fetchArtistTracks(artistId, token);
        
        if (fetchedTracks.length > 0) {
          const artistUsername = fetchedTracks[0].artists[0];
          const userResponse = await fetchUserByUsername(artistUsername, token);
          const verificationRecords = await fetchAllArtistsVerification(artistId);
          const verificationRecord = verificationRecords.find((record: { artistId: string; }) => record.artistId === artistId);
          const verificationStatus = verificationRecord ? verificationRecord.status : "unsubmitted";
          
          const artistData: Artist = {
            id: artistId,
            name: userResponse.username || artistUsername,
            role: "artist",
            profilePic: userResponse.profilePic || "/default-image.png",
            banner: userResponse.banner || "/default-banner.jpg",
            isActive: userResponse.isActive || true,
            bio: userResponse.bio || "",
            verificationStatus,
          };
  
          setArtist(artistData);
          setTracks(fetchedTracks);
          setError(null);
  
          if (user?._id) {
            const fetchedPlaylists = await getMyplaylist(user._id);
            setPlaylists(fetchedPlaylists);
          }
        } else {
          setError("No tracks found for this artist");
        }
      } catch (err: any) {
        setError("Failed to load artist details or tracks");
      } finally {
        setLoading(false);
      }
    };
    loadArtistDetails();
  }, [artistId, user?._id]);

  useEffect(() => {
    if (user?.likedSongs) {
      console.log("user.likedSongs:", user.likedSongs);
      setLikedSongs(new Set(user.likedSongs.map(String)));
    }
  }, [user?.likedSongs]);

  const totalListeners = tracks.reduce((sum, track) => sum + (track.listeners?.length || 0), 0);

  const handlePlay = (track: Track) => {
    
    if (currentTrack?.fileUrl === track.fileUrl) {
      if (isPlaying) {
        audio.pause();
        dispatch(setIsPlaying(false));
      } else {
        audio.play().then(() => dispatch(setIsPlaying(true))).catch((err) => console.error("Playback error:", err));
      }
    } else {
      dispatch(setCurrentTrack(track));
      audio.src = track.fileUrl;
      audio.play().then(() => dispatch(setIsPlaying(true))).catch((err) => console.error("Playback error:", err));
    }
  };

  const handleLike = async (trackId: string) => {
    console.log("handleLike called with trackId:", trackId);
    const token = localStorage.getItem("token");
    if (!token || !trackId || !user?._id) {
      console.log("Missing token, trackId, or user._id:", { token, trackId, userId: user?._id });
      toast.error("Please log in to like songs");
      return;
    }
    const isCurrentlyLiked = likedSongs.has(trackId);
    try {
      const updatedUser = await toggleLike(user._id, trackId, token);
      console.log("toggleLike response:", updatedUser);
      dispatch(saveSignupData(updatedUser));
      setLikedSongs((prev) => {
        const newLiked = new Set(prev);
        if (isCurrentlyLiked) {
          newLiked.delete(trackId);
          toast.success("Removed from liked songs");
        } else {
          newLiked.add(trackId);
          toast.success("Added to liked songs");
        }
        console.log("Updated likedSongs:", newLiked);
        return newLiked;
      });
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to toggle like");
    }
  };

  const handleAddToPlaylist = async (trackId: string, playlistId: string) => {
    const token = localStorage.getItem("token");
    if (!token || !user?._id) {
      toast.error("Please log in to add to playlist");
      return;
    }
    try {
      await addTrackToPlaylist(user._id, playlistId, trackId, token);
      const playlist = playlists.find((p) => p._id === playlistId);
      toast.success(`Added to ${playlist.title}`);
      setDropdownTrackId(null);
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  const handleAddToQueue = (track: Track) => {
    const queueEntry = {
      id: track._id,
      title: track.title,
      artists: track.artists,
      fileUrl: track.fileUrl,
      img: track.img,
    };
    const storedQueue = JSON.parse(localStorage.getItem("playQueue") || "[]");
    const updatedQueue = [...storedQueue, queueEntry].filter(
      (q, index, self) => index === self.findIndex((t) => t.id === q.id)
    );
    localStorage.setItem("playQueue", JSON.stringify(updatedQueue));
    toast.success(`Added ${track.title} to queue`);
  };

  const handleDownload = async (fileUrl: string, title: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to download");
      return;
    }
    try {
      const response = await fetch(fileUrl, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title}.flac`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded ${title}`);
    } catch (error) {
      toast.error("Failed to download the track");
    }
  };

  const toggleModal = () => {
    setIsModalOpen((prev) => !prev);
  };

  if (!artistId) return <div>Artist not found</div>;

  return (
    <div className="flex h-screen flex-col bg-black text-white">
      <div className="flex flex-1">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <main className="flex-1 min-h-screen ml-64 bg-black overflow-y-auto">
          <section className="px-6 py-4">
            {loading ? (
              <div className="text-center py-4">Loading artist details...</div>
            ) : error ? (
              <div className="text-red-400 text-center py-4">{error}</div>
            ) : artist ? (
              <>
                <div className="relative w-full h-[300px] rounded-lg overflow-hidden shadow-lg mb-6">
                  {artist.banner && isVideo(artist.banner) ? (
                    <video
                      src={artist.banner}
                      autoPlay
                      loop
                      muted
                      className="w-full h-full object-cover opacity-80"
                    />
                  ) : (
                    <img
                      src={artist.banner || "/default-banner.jpg"}
                      alt={`${artist.name} banner`}
                      className="w-full h-full object-cover opacity-80"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute inset-0 flex items-center px-6">
                    <img
                      src={artist.profilePic}
                      alt={artist.name}
                      className="w-32 h-32 object-cover rounded-full border-2 border-white"
                    />
                    <div className="ml-6">
                      <div className="flex items-center">
                        <h2
                          className="text-4xl font-bold text-white"
                          style={{ textShadow: '2px 2px 6px rgba(0, 0, 0, 0.8)' }}
                        >
                          {artist.name}
                        </h2>
                        {artist.verificationStatus === "approved" && (
                        
<BadgeCheck
  size={30}
  className="ml-2 text-blue-600 fill-blue-600 stroke-white"
  strokeWidth={1.5}
/>

                        )}
                      </div>
                      {artist.bio && (
                        <p
                          className="text-gray-300 mt-2"
                          style={{ textShadow: '1px 1px 4px rgba(0, 0, 0, 0.8)' }}
                        >
                          {artist.bio}
                        </p>
                      )}
                      {totalListeners > 0 && (
                        <p
                          className="text-gray-300"
                          style={{ textShadow: '1px 1px 4px rgba(0, 0, 0, 0.8)' }}
                        >
                          Listeners: {totalListeners}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-4">Songs</h3>
                {tracks.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {tracks.map((track) => (
                      <div
                        key={track._id}
                        className="group bg-[#1d1d1d] rounded-lg p-4 hover:bg-[#242424] transition-colors flex flex-col"
                      >
                        <div className="w-full h-[200px] flex flex-col mb-3">
                          <div className="relative w-full h-[90%]">
                            <img
                              src={track.img || "/placeholder.svg"}
                              alt={track.title}
                              className="w-full h-full object-cover rounded-t-md"
                            />
                            <button
                              onClick={() => handlePlay(track)}
                              className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-10 rounded-t-md"
                            >
                              {currentTrack?.fileUrl === track.fileUrl && isPlaying ? (
                                <Pause size={24} className="text-white" />
                              ) : (
                                <Play size={24} className="text-white" />
                              )}
                            </button>
                          </div>
                          <img
                            src={track.img || "/placeholder.svg"}
                            alt={`${track.title} blur`}
                            className="w-full h-[10%] object-cover rounded-b-md blur-lg"
                          />
                        </div>
                        <div className="text-white font-semibold truncate">{track.title}</div>
                        <div className="text-gray-400 text-sm truncate">
                          {Array.isArray(track.artists) ? track.artists.join(", ") : track.artists}
                        </div>
                        {user?.premium !== "Free" && (
                          <div className="relative flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              className="p-1 hover:bg-[#333333] rounded-full text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDropdownTrackId(dropdownTrackId === track._id ? null : track._id);
                              }}
                            >
                              <Plus size={16} />
                            </button>
                            {dropdownTrackId === track._id && (
                              <div className="absolute left-0 mt-8 w-48 bg-[#242424] rounded-md shadow-lg z-20">
                                <ul className="py-1">
                                  {playlists.length > 0 ? (
                                    playlists.map((playlist) => (
                                      <li
                                        key={playlist._id}
                                        className="px-4 py-2 hover:bg-[#333333] cursor-pointer text-white"
                                        onClick={() => handleAddToPlaylist(track._id, playlist._id)}
                                      >
                                        {playlist.title}
                                      </li>
                                    ))
                                  ) : (
                                    <li className="px-4 py-2 text-gray-400">No playlists available</li>
                                  )}
                                </ul>
                              </div>
                            )}
                            <button
                              onClick={() => handleLike(track._id)}
                              className={`p-1 hover:bg-[#333333] rounded-full ${likedSongs.has(track._id) ? "text-red-500" : "text-white"}`}
                            >
                              <Heart size={16} fill={likedSongs.has(track._id) ? "currentColor" : "none"} />
                            </button>
                            <button
                              className="p-1 hover:bg-[#333333] rounded-full text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(track.fileUrl, track.title);
                              }}
                            >
                              <Download size={16} />
                            </button>
                            <button
                              className="p-1 hover:bg-[#333333] rounded-full text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToQueue(track);
                              }}
                            >
                              <ListMusic size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-center py-4">No songs found for this artist.</div>
                )}
              </>
            ) : (
              <div className="text-gray-400 text-center py-4">Artist not found.</div>
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