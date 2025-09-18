import { useNavigate } from "react-router-dom";
import { clearAuthUtil } from "./clearAuth";
import { useDispatch } from "react-redux";
import { clearSignupData } from "../redux/userSlice";
import { clearAudioState } from "../redux/audioSlice";

export const useClearAuth = () => {
  const navigate = useNavigate();
    const dispatch = useDispatch()
  return () => {
    clearAuthUtil();
    dispatch(clearSignupData());
    dispatch(clearAudioState());
    navigate("/", { replace: true });
  };
};
