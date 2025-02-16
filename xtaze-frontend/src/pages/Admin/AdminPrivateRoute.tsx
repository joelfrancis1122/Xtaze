import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

const AdminProtectedRoute = () => {
    console.log("entha role ")
  const token = localStorage.getItem("token");
  const role = useSelector((state: RootState) => state.admin.signupData?.role);
  // console.log(role,"entha role sss ")  
  if (!token || role !== "admin") {
      return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
