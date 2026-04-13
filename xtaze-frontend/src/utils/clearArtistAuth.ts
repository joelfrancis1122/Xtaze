import { store } from "../store/store";
import { clearAudioState } from "../redux/audioSlice";
import { audio } from "./audio";
import { clearArtistData } from "../redux/artistSlice";

export const clearArtistAuthUtil = () => {
  try {
    console.log("Logging out user");

    if (audio) {
      audio.pause();
      audio.src = "";
    }

    store.dispatch(clearArtistData());
    store.dispatch(clearAudioState());

    localStorage.removeItem("token");

    document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  } catch (err) {
    console.error("clearAuthUtil error:", err);
  }
};
