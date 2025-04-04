import { LayoutGrid  , Globe, Home, LifeBuoy, Music, User, LogOut } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearArtistData } from "../../../redux/artistSlice";
import { Button } from "../../../components/ui/button";

const ArtistSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("artistToken");
    dispatch(clearArtistData());
    navigate("/artist"); 
  };

  return (
    <aside className="sticky top-0 left-0  w-64 border-r bg-background/50 backdrop-blur flex flex-col h-screen">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Music className="h-6 w-6" />
        <span className="font-bold">ArtistDash</span>
      </div>
      
      <nav className="space-y-2 px-2 py-4">
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => navigate("/artist/dashboard")}>
          <LayoutGrid   className="h-4 w-4" />
            Dashboard
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => navigate("/artist/profile")}>
          <User className="h-4 w-4" />
          Profile
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => navigate("/artist/analytics")}>
          <Globe className="h-4 w-4" />
          Update Tracks
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => navigate("/artist/releases")}>
          <Home className="h-4 w-4" />
          Releases
        </Button>
        {/* <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => navigate("/artist/playlists")}>
          <Music className="h-4 w-4" />
          Playlists
        </Button> */}
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => navigate("/artist/monetization")}>
          <LifeBuoy className="h-4 w-4" />
          Monetization
        </Button>
        {/* <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => navigate("/artist/settings")}>
          <Settings className="h-4 w-4" />
          Settings
        </Button> */}
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-4 w-full px-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default ArtistSidebar;
