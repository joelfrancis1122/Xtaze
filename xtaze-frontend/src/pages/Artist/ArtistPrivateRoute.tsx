import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

const ArtistProtectRoute = () => {

  const role = useSelector((state: RootState) => state.artist.signupData?.role);
  const artist = useSelector((state: RootState) => state.artist.signupData);
  if (role !== "artist"||!artist?.isActive) {
     localStorage.removeItem("artistToken");
      return <Navigate to="/artist" replace />;
  }

  return <Outlet />;
};

export default ArtistProtectRoute;
