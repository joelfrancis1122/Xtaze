import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "../../store/store";
import { clearSignupData } from "../../redux/userSlice";
import { audio } from "../../utils/audio";
const PrivateRoute = () => {
  const token = localStorage.getItem("token");
  const dispatch = useDispatch()
  const role = useSelector((state: RootState) => state.user.signupData?.role);
  const user = useSelector((state: RootState) => state.user.signupData);
  if (!token || role !== "user" || !user?.isActive) {
    dispatch(clearSignupData())
    console.log("clear ayi poi")
    audio.pause();
    audio.src = "";
    localStorage.removeItem("token");
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default PrivateRoute;
