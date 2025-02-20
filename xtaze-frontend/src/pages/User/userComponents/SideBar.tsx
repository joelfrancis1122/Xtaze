import { MoreHorizontal } from "lucide-react"
import profileImg from "../../../assets/1.jpeg"
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const signupData = useSelector((state: RootState) => state.user.signupData);
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/profile");
  };
  return (
    <aside className="fixed w-64 p-6 bg-[#121212] h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10" onClick={handleProfileClick}>
            <img
              src={String(signupData?.profilePic) || profileImg}
              alt="Profile"
              className="w-10 h-10 rounded-full relative z-10"
            />
            <div className="absolute inset-0.5 bg-red-500 opacity-50 rounded-full blur-md"></div>
          </div>
          <span className="text-white font-medium">{signupData?.username}</span>
        </div>
        <button className="text-gray-400 hover:text-white">
          <MoreHorizontal size={20} />
        </button>
      </div>
      <nav className="space-y-6">
        <div className="space-y-2">
          <a href="#" className="text-white hover:text-primary block" onClick={() => navigate("/home")}>
            Home
          </a>
          <a href="#" className="text-white hover:text-primary block">
            Explore
          </a>
          <a href="#" className="text-white hover:text-primary block">
            Videos
          </a>
        </div>
        <div className="pt-4">
          <h3 className="text-sm uppercase text-gray-400 mb-4">MY COLLECTION</h3>
          <div className="space-y-2">
            <a href="#" className="text-gray-300 hover:text-white block">
              Mixes & Radio
            </a>
            <a href="#" className="text-gray-300 hover:text-white block">
              Playlists
            </a>
            <a href="#" className="text-gray-300 hover:text-white block">
              Albums
            </a>
            <a href="#" className="text-gray-300 hover:text-white block">
              Tracks
            </a>
            <a href="#" className="text-gray-300 hover:text-white block">
              Videos
            </a>
            <a href="#" className="text-gray-300 hover:text-white block">
              Artists
            </a>
          </div>
        </div>
      </nav>
    </aside>
  )
}

