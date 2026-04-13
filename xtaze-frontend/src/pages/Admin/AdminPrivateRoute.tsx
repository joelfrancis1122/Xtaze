import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

const AdminProtectedRoute = () => {
  const token = localStorage.getItem("adminToken");
  const role = useSelector((state: RootState) => state.admin.signupData?.role);
  if (!token || role !== "admin") {
      return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
