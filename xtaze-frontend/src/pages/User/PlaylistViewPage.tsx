import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Heart, MoreHorizontal, Play, Share2, Shuffle } from "lucide-react";
import Sidebar from "./userComponents/SideBar";

interface Track {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  liked: boolean;
}

export default function PlaylistPageView() {
  const [tracks, setTracks] = useState<Track[]>([
    { id: 1, title: "Higher Ground", artist: "ODESZA", album: "A Moment Apart", duration: "3:42", liked: false },
    { id: 2, title: "Midnight City", artist: "M83", album: "Hurry Up, We're Dreaming", duration: "4:03", liked: true },
    { id: 3, title: "Innerbloom", artist: "RÜFÜS DU SOL", album: "Bloom", duration: "9:38", liked: false },
    { id: 4, title: "Strobe", artist: "deadmau5", album: "For Lack of a Better Name", duration: "10:37", liked: true },
  ]);

  const toggleLike = (id: number) => {
    setTracks(
      tracks.map((track) => (track.id === id ? { ...track, liked: !track.liked } : track))
    );
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col px-8 py-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-60 h-60 md:w-72 md:h-72 rounded-md overflow-hidden shadow-lg">
            <img src="/placeholder.svg" alt="Playlist cover" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-gray-400">PLAYLIST</p>
            <h1 className="text-3xl md:text-5xl font-bold">Electronic Essentials</h1>
            <p className="text-gray-400">The best electronic tracks from around the world. Updated weekly.</p>
          </div>
        </div>

        {/* Controls Section */}
        <div className="flex items-center gap-4 mt-6">
          <button className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center">
            <Play className="h-6 w-6" />
          </button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-700">
            <Shuffle className="h-5 w-5" />
          </button>
          <button className="ml-auto w-10 h-10 rounded-full flex items-center justify-center bg-gray-700">
            <Share2 className="h-5 w-5" />
          </button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-700">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        <hr className="border-gray-700 my-6" />

        {/* Tracks Section */}
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-700">
              <th className="text-left py-2">#</th>
              <th className="text-left py-2">Title</th>
              <th className="text-left py-2 hidden md:table-cell">Album</th>
              <th className="text-right py-2"><Clock className="h-4 w-4" /></th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((track, index) => (
              <tr key={track.id} className="group hover:bg-gray-800 h-12 transition">
                <td className="text-gray-400 group-hover:text-white px-2">{index + 1}</td>
                <td className="px-2">
                  <p className="font-medium">{track.title}</p>
                  <p className="text-gray-400 text-xs">{track.artist}</p>
                </td>
                <td className="hidden md:table-cell text-gray-400 px-2">{track.album}</td>
                <td className="text-right text-gray-400 px-2">{track.duration}</td>
                <td className="px-2">
                  <button onClick={() => toggleLike(track.id)} className="opacity-0 group-hover:opacity-100 transition">
                    <Heart className={`h-4 w-4 ${track.liked ? "fill-white text-white" : ""}`} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}