import { useSelector } from "react-redux";
import {Outlet, useNavigate } from "react-router-dom";
import { RootState } from "../../store/store";
import { useClearAuth } from "../../utils/useClearAuth";

const PrivateRoute = () => {
  const clearAuth = useClearAuth();
  const navigate = useNavigate()
  const role = useSelector((state: RootState) => state.user.signupData?.role);
  const user = useSelector((state: RootState) => state.user.signupData);

  if (role !== "user" || !user?.isActive) {
    clearAuth(); 
    navigate("/")
    return null; 
  }

  return <Outlet />;
};

export default PrivateRoute;
