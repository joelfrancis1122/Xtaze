import { Navigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { clearArtistData } from "../../redux/artistSlice";

const ArtistProtectRoute = () => {
    const dispatch = useDispatch()

  const token = localStorage.getItem("artistToken");
  const role = useSelector((state: RootState) => state.artist.signupData?.role);
  const artist = useSelector((state: RootState) => state.artist.signupData);
  if (!token || role !== "artist"||!artist?.isActive) {
    dispatch(clearArtistData())

     localStorage.removeItem("artistToken");
      return <Navigate to="/artist" replace />;
  }

  return <Outlet />;
};

export default ArtistProtectRoute;
