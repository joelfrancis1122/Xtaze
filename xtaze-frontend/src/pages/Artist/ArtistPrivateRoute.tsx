import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

const ArtistProtectRoute = () => {
    console.log("entha role ")
  const token = localStorage.getItem("artistToken");
  const role = useSelector((state: RootState) => state.artist.signupData?.role);
  console.log(role,"entha role  ")
  if (!token || role !== "artist") {
      return <Navigate to="/artist" replace />;
  }

  return <Outlet />;
};

export default ArtistProtectRoute;
