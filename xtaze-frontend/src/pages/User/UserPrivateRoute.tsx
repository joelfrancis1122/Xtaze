import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "../../store/store";

const PrivateRoute = () => {
  const token = localStorage.getItem("token");
  const role = useSelector((state: RootState) => state.user.signupData?.role);
  // console.log("private")
  if (!token || role !== "user") {
    return <Navigate to="/" replace />;
}
  return <Outlet />;
};

export default PrivateRoute;
