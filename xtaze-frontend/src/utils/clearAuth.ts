// import { store } from "../store/store";
// import { clearSignupData } from "../redux/userSlice";
import { audio } from "./audio";

export const clearAuth = () => {
  try {
    audio.pause();
    audio.src = "";
    // store.dispatch(clearSignupData());
    // localStorage.removeItem("token");
    // document.cookie =
    //   "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // console.log("✅ Auth cleared, user logged out");
  } catch (err) {
    console.error("clearAuth error:", err);
  }
};
