import { store } from "../store/store";
import { clearSignupData } from "../redux/userSlice";
import { clearAudioState } from "../redux/audioSlice";
import { audio } from "./audio";

export const clearAuthUtil = () => {
  try {
    console.log("Logging out user");

    if (audio) {
      audio.pause();
      audio.src = "";
    }

    store.dispatch(clearSignupData());
    store.dispatch(clearAudioState());

    localStorage.removeItem("token");

  } catch (err) {
    console.error("clearAuthUtil error:", err);
  }
};
