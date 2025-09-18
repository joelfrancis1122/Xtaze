import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "../../store/store";
import { useClearAuth } from "../../utils/useClearAuth";

const PrivateRoute = () => {
  const clearAuth = useClearAuth();
  const role = useSelector((state: RootState) => state.user.signupData?.role);
  const user = useSelector((state: RootState) => state.user.signupData);

  if (role !== "user" || !user?.isActive) {
    clearAuth(); 
    <Navigate to="/" replace />;
    return null; 
  }

  return <Outlet />;
};

export default PrivateRoute;
