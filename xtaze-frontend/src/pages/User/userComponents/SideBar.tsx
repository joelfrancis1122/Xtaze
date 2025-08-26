
import { Crown, MoreHorizontal } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { useNavigate } from "react-router-dom";
import ProfileP from "../../../assets/profile4.jpeg";
import { Menu } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const signupData = useSelector((state: RootState) => state.user.signupData);
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-[#121212] border-r border-gray-800 shadow-lg transition-all duration-300 z-30 ${
        isOpen ? "w-64 p-6" : "w-0 p-0 overflow-hidden"
      } md:w-64 md:p-6 md:block`}
    >
      {/* Hamburger menu for mobile */}
      <div className="md:hidden p-4">
        <button onClick={() => setIsOpen(!isOpen)} className="text-white">
          <Menu size={24} />
        </button>
      </div>
      <div
        className={`flex flex-col h-full ${isOpen ? "opacity-100" : "opacity-0"} transition-opacity duration-300 md:opacity-100`}
      >
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
              {signupData?.premium !== "Free" && (
                <span className="absolute -bottom-1 -right-1 bg-black-800 text-yellow-400 text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center z-20">
                  <Crown />
                </span>
              )}
            </div>
            <span className="text-white font-semibold text-base truncate">{signupData?.username}</span>
          </div>
          <button className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-[#242424] transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>
        <nav className="space-y-8 flex-1">
          <div className="space-y-3">
            <a
              href="#"
              className="text-white font-medium hover:text-gray-200 block transition-colors"
              onClick={() => navigate("/home")}
            >
              Home
            </a>
            {signupData && typeof signupData.premium === "string" && signupData.premium !== "Free" && (

            <a
              onClick={() => navigate("/explore")}
              className="text-white font-medium hover:text-gray-200 block transition-colors"
            >
              Explore
            </a>
            )}
            <a
              onClick={() => navigate("/videos")}
              className="text-white font-medium hover:text-gray-200 block transition-colors"
            >
              Videos
            </a>
          </div>
          <div className="pt-4">
            <h3 className="text-xs uppercase text-gray-400 mb-4 tracking-wider">My Collection</h3>
            {signupData && typeof signupData.premium === "string" && signupData.premium !== "Free" && (
              <div className="space-y-3">
                <a
                  onClick={() => navigate("/likedsongs")}
                  className="text-gray-300 hover:text-white block transition-colors"
                >
                  Liked Songs
                </a>
                
                <a
                  onClick={() => navigate("/artists")}
                  className="text-gray-300 hover:text-white block transition-colors"
                >
                  Artists
                </a>

                <a
                  onClick={() => navigate("/albums")}
                  className="text-gray-300 hover:text-white block transition-colors"
                >
                  Albums
                </a>
                <a
                  onClick={() => navigate(`/playlist/${signupData?.id}`)}
                  className="text-gray-300 hover:text-white block transition-colors"
                >
                  Playlists
                </a>
                <a
                  onClick={() => navigate("/recentSongs")}
                  className="text-gray-300 hover:text-white block transition-colors"
                >
                  Recent Songs
                </a>
                <a
                  onClick={() => navigate("/equalizer")}
                  className="text-gray-300 hover:text-white block transition-colors"
                >
                  Equalizer
                </a>
              </div>
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
}