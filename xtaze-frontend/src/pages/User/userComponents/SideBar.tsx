"use client";

import { MoreHorizontal } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { useNavigate } from "react-router-dom";
import ProfileP from "../../../assets/profile6.jpeg";

export default function Sidebar() {
  const signupData = useSelector((state: RootState) => state.user.signupData);
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/profile");
  };
  const likedSongs =()=>{
    navigate('/likedSongs')
  }
  const user = useSelector((state: RootState) => state.user.signupData)

  return (
    <aside className="fixed w-64 p-6 bg-[#121212] h-full border-r border-gray-800 shadow-lg">
<div className="flex items-center justify-between mb-8">
  <div className="flex items-center gap-4">
    <div className="relative w-10 h-10" onClick={handleProfileClick}>
      <img
        src={(signupData?.profilePic as string) ?? ProfileP}
        alt="Profile"
        className="w-10 h-10 rounded-full relative z-10"
      />
      <div className="absolute inset-0.5 bg-red-500 opacity-50 rounded-full blur-md"></div>
      {/* Premium badge */}
      {signupData?.premium && (
        <span className="absolute -bottom-1 -right-1 bg-red-800 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center z-20">
          P
        </span>
      )}
    </div>
    <span className="text-white font-semibold text-base truncate">{signupData?.username}</span>
  </div>
  <button className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-[#242424] transition-colors">
    <MoreHorizontal size={20} />
  </button>
</div>
      <nav className="space-y-8">
        <div className="space-y-3">
          <a
            href="#"
            className="text-white font-medium hover:text-gray-200 block transition-colors"
            onClick={() => navigate("/home")}
          >
            Home
          </a>
          <a href="#" className="text-white font-medium hover:text-gray-200 block transition-colors">
            Explore
          </a>
          <a href="#" className="text-white font-medium hover:text-gray-200 block transition-colors">
            Videos
          </a>
        </div>
        <div className="pt-4">
          <h3 className="text-xs uppercase text-gray-400 mb-4 tracking-wider">My Collection</h3>
          <div className="space-y-3">
            <a onClick={likedSongs} className="text-gray-300 hover:text-white block transition-colors">
              Liked Songs
            </a>
            <a href="#" className="text-gray-300 hover:text-white block transition-colors">
              Mixes & Radio
            </a>
            <a href="#" className="text-gray-300 hover:text-white block transition-colors">
              Playlists
            </a>
            <a href="#" className="text-gray-300 hover:text-white block transition-colors">
              Albums
            </a>
            <a href="#" className="text-gray-300 hover:text-white block transition-colors">
              Tracks
            </a>
            <a href="#" className="text-gray-300 hover:text-white block transition-colors">
              Videos
            </a>
            <a href="#" className="text-gray-300 hover:text-white block transition-colors">
              Artists
            </a>
          </div>
        </div>
      </nav>
    </aside>
  );
}