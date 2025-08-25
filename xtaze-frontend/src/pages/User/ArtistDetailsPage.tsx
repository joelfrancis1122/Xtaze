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
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
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
        const fetchedTracks = await fetchArtistTracks(artistId);
        console.log(fetchedTracks, "huhh")
        if (fetchedTracks.length > 0) {
          const artistUsername = fetchedTracks[0].artists[0];
          console.log(artistUsername, "ambi")
          const userResponse = await fetchUserByUsername(artistUsername);
          const verificationRecords = await fetchAllArtistsVerification();
          console.log(verificationRecords.data, "ambi2sss2s")
          const verificationRecord = verificationRecords.data.find(
            (record: { artistId: string }) => record.artistId === artistId
          ); console.log(artistUsername, "ambi23s")
          const verificationStatus = verificationRecord ? verificationRecord.status : "unsubmitted";

          console.log(artistUsername, "ambis")
          const artistData: Artist = {
            id: artistId,
            name: artistUsername,
            role: "artist",
            profilePic: userResponse.profilePic || "",
            banner: userResponse?.banner || "",
            isActive: userResponse.isActive || true,
            bio: userResponse?.bio || "",
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
        console.log(err)
        setError("Failed to load artist details or tracks");
      } finally {
        setLoading(false);
      }
    };
    loadArtistDetails();
  }, [artistId, user?._id]);

  useEffect(() => {
    if (user?.likedSongs) {
      setLikedSongs(new Set(user.likedSongs.map(String)));
    }
  }, [user?.likedSongs]);
console.log(tracks,"adi adi adi")
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
    const token = localStorage.getItem("token");
    if (!token || !trackId || !user?._id) {
      toast.error("Please log in to like songs");
      return;
    }
    const isCurrentlyLiked = likedSongs.has(trackId);
    try {
      const updatedUser = await toggleLike(user._id, trackId);
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
        return newLiked;
      });
    } catch (error) {
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
      await addTrackToPlaylist(user._id, playlistId, trackId);
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
              <a
                href="/artists"
                className="hover:text-white transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/artists");
                }}
              >
                Artists
              </a>
              <span className="mx-2"></span>
              <span className="text-white">{artist?.name || "Artist"}</span>
            </nav>
            {loading ? (
              <div className="text-center py-3 sm:py-4 text-sm sm:text-base text-gray-400">
                Loading artist details...
              </div>
            ) : error ? (
              <div className="text-red-400 text-center py-3 sm:py-4 text-sm sm:text-base">
                {error}
              </div>
            ) : artist ? (
              <>
                <div className="relative w-full h-[200px] sm:h-[300px] rounded-lg overflow-hidden shadow-lg mb-4 sm:mb-6">
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
                  <div className="absolute inset-0 flex items-center px-4 sm:px-6">
                    <img
                      src={artist.profilePic}
                      alt={artist.name}
                      className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-full border-2 border-white"
                    />
                    <div className="ml-4 sm:ml-6">
                      <div className="flex items-center">
                        <h2
                          className="text-2xl sm:text-4xl font-bold text-white"
                          style={{ textShadow: '2px 2px 6px rgba(0, 0, 0, 0.8)' }}
                        >
                          {artist.name}
                        </h2>
                        {artist.verificationStatus === "approved" && (
                          <BadgeCheck
                            size={20}
                            className="ml-2 text-blue-600 fill-blue-600 stroke-white sm:size-10"
                            strokeWidth={1.5}
                          />
                        )}
                      </div>
                      {artist.bio && (
                        <p
                          className="text-gray-300 mt-1 sm:mt-2 text-sm sm:text-base"
                          style={{ textShadow: '1px 1px 4px rgba(0, 0, 0, 0.8)' }}
                        >
                          {artist.bio}
                        </p>
                      )}
                      {totalListeners > 0 && (
                        <p
                          className="text-gray-300 text-sm sm:text-base"
                          style={{ textShadow: '1px 1px 4px rgba(0, 0, 0, 0.8)' }}
                        >
                          Listeners: {totalListeners}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Songs</h3>
                {tracks.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 overflow-hidden">
                    {tracks.map((track) => (
                      <div
                        key={track._id}
                        className="group bg-[#1d1d1d] rounded-lg p-3 sm:p-4 hover:bg-[#242424] active:bg-[#242424] transition-colors duration-200 flex flex-col box-content"
                      >
                        <div className="w-full h-[180px] sm:h-[200px] flex flex-col mb-2 sm:mb-3">
                          <div className="relative w-full h-[90%]">
                            <img
                              src={track.img || "/placeholder.svg"}
                              alt={track.title}
                              className="w-full h-full object-cover rounded-t-md"
                            />
                            <button
                              onClick={() => handlePlay(track)}
                              className="absolute inset-0 flex items-center justify-center bg-black/50 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity duration-200 z-10 rounded-t-md"
                            >
                              {currentTrack?.fileUrl === track.fileUrl && isPlaying ? (
                                <Pause size={20} className="text-white" />
                              ) : (
                                <Play size={20} className="text-white" />
                              )}
                            </button>
                          </div>
                          <img
                            src={track.img || "/placeholder.svg"}
                            alt={`${track.title} blur`}
                            className="w-full h-[10%] object-cover rounded-b-md blur-lg"
                          />
                        </div>
                        <div className="text-white font-semibold truncate text-sm sm:text-base">
                          {track.title}
                        </div>
                        <div className="text-gray-400 text-xs sm:text-sm truncate">
                          {Array.isArray(track.artists) ? track.artists.join(", ") : track.artists}
                        </div>
                        {user?.premium !== "Free" && (
                          <div className="relative flex gap-2 mt-2 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity duration-200">
                            <button
                              className="p-2 hover:bg-[#333333] active:bg-[#333333] rounded-full text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDropdownTrackId(dropdownTrackId === track._id ? null : track._id);
                              }}
                            >
                              <Plus size={20} />
                            </button>
                            {dropdownTrackId === track._id && (
                              <div className="absolute left-auto right-0 mt-8 w-40 sm:w-48 bg-[#242424] rounded-md shadow-lg z-20">
                                <ul className="py-1">
                                  {playlists.length > 0 ? (
                                    playlists.map((playlist) => (
                                      <li
                                        key={playlist._id}
                                        className="px-3 sm:px-4 py-1 sm:py-2 hover:bg-[#333333] cursor-pointer text-sm sm:text-base text-white"
                                        onClick={() => handleAddToPlaylist(track._id, playlist._id)}
                                      >
                                        {playlist.title}
                                      </li>
                                    ))
                                  ) : (
                                    <li className="px-3 sm:px-4 py-1 sm:py-2 text-gray-400 text-sm sm:text-base">
                                      No playlists available
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}
                            <button
                              onClick={() => handleLike(track._id)}
                              className={`p-2 hover:bg-[#333333] active:bg-[#333333] rounded-full ${likedSongs.has(track._id) ? "text-red-500" : "text-white"}`}
                            >
                              <Heart size={20} fill={likedSongs.has(track._id) ? "currentColor" : "none"} />
                            </button>
                            <button
                              className="p-2 hover:bg-[#333333] active:bg-[#333333] rounded-full text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(track.fileUrl, track.title);
                              }}
                            >
                              <Download size={20} />
                            </button>
                            <button
                              className="p-2 hover:bg-[#333333] active:bg-[#333333] rounded-full text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToQueue(track);
                              }}
                            >
                              <ListMusic size={20} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-center py-3 sm:py-4 text-sm sm:text-base">
                    No songs found for this artist.
                  </div>
                )}
              </>
            ) : (
              <div className="text-gray-400 text-center py-3 sm:py-4 text-sm sm:text-base">
                Artist not found.
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