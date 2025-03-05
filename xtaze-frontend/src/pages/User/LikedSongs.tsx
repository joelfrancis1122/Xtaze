"use client";

import { useState, useEffect } from "react";
import Sidebar from "./userComponents/SideBar";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PlayCircle, PauseCircle } from "lucide-react";
import { audio } from "../../utils/audio";
import { setCurrentTrack, setIsPlaying } from "../../redux/audioSlice";
import { Track } from "./Types";
import { fetchLikedSongs } from "../../services/userService";

interface UserSignupData {
  _id?: string;
  username: string;
  country: string;
  gender: string;
  year: string;
  phone: string;
  email: string;
  role?: string;
  isActive?: boolean;
  premium?: boolean;
  profilePic?: string;
  likedSongs?: string[];
}

export default function LikedSongsPage() {
  const user = useSelector((state: RootState) => state.user.signupData) as UserSignupData | null;
  const { currentTrack, isPlaying } = useSelector((state: RootState) => state.audio);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [likedSongs, setLikedSongs] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getLikedSongs = async () => {
      const token = localStorage.getItem("token");
      if (!token || !user?._id || !user?.likedSongs || user.likedSongs.length === 0) {
        setLikedSongs([]);
        setLoading(false);
        return;
      }
      if (user.premium === false) {
        toast.error("You have to be a premium user for this functionality");
        setLikedSongs([]);
        setLoading(false);
        return;
      }

      try {
        const tracks = await fetchLikedSongs(user._id, token, user.likedSongs);
        setLikedSongs(tracks);
      } catch (error) {
        toast.error("Error fetching liked songs", { position: "top-right" });
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      getLikedSongs();
    }
  }, [user?._id, user?.likedSongs, navigate]);

  useEffect(() => {
    if (!user?._id) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handlePlay = (song: Track) => {
    if (currentTrack?.fileUrl === song.fileUrl) {
      if (isPlaying) {
        audio.pause();
        dispatch(setIsPlaying(false));
      } else {
        audio.play();
        dispatch(setIsPlaying(true));
      }
    } else {
      audio.src = song.fileUrl;
      audio.play();
      dispatch(setCurrentTrack({
        _id: song._id,
        title: song.title,
        artist: song.artist,
        fileUrl: song.fileUrl,
        img: song.img,
        album: song.album,
        genre: song.genre,
        listeners: song.listeners || 0,
      }));
      dispatch(setIsPlaying(true));
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar />
      <main className="flex-1 ml-[240px] py-16 px-6">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-5xl font-bold">Liked Songs</h1>
            </div>
            <p className="text-gray-400 text-base">{likedSongs.length} songs</p>
          </div>
          {loading ? (
            <div className="text-center py-4 text-gray-400">Loading liked songs...</div>
          ) : likedSongs.length > 0 ? (
            <div className="bg-[#151515] rounded-xl shadow-lg border border-black-900 overflow-hidden">
              <div className="grid grid-cols-[48px_2fr_1fr_1fr_48px] gap-4 px-6 py-4 text-gray-400 text-lg font-semibold border-b border-gray-700">
                <span className="text-center">#</span>
                <span>Title</span>
                <span>Artist</span>
                <span>Album</span>
                <span></span>
              </div>
              {likedSongs.map((song, index) => (
                <div
                  key={song._id}
                  className="grid grid-cols-[48px_2fr_1fr_1fr_48px] gap-4 px-6 py-4 hover:bg-[#212121] transition-all duration-200 cursor-pointer items-center group"
                >
                  <span className="text-gray-400 text-lg text-center">{index + 1}</span>
                  <div className="flex items-center space-x-4 truncate">
                    <div className="w-10 h-10 bg-gray-700 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                      {song.img ? (
                        <img src={song.img} alt={song.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-400">🎵</span>
                      )}
                    </div>
                    <div className="truncate">
                      <h3 className="text-white font-medium text-lg truncate">{song.title}</h3>
                    </div>
                  </div>
                  <span className="text-gray-400 text-lg truncate">
                    {Array.isArray(song.artist) ? song.artist.join(", ") : song.artist}
                  </span>
                  <span className="text-gray-400 text-lg truncate">{song.album}</span>
                  <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlay(song);
                      }}
                    >
                      {currentTrack?.fileUrl === song.fileUrl && isPlaying ? (
                        <PauseCircle size={24} className="text-green-500" />
                      ) : (
                        <PlayCircle size={24} className="text-red-500" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#1d1d1d] p-8 rounded-xl shadow-md border border-gray-800 text-center">
              <p className="text-gray-400 text-lg">No liked songs yet. Start liking some premium tracks!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}