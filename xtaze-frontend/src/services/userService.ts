import { useDispatch } from "react-redux";
import { artistApi, deezerApi, providerApi, userApi } from "../api/axios";
import { Track } from "../pages/User/Types";
import { saveSignupData } from "../redux/userSlice";

// Utility to get cookies
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop()?.split(";").shift() || null : null;
};

// Simplified Axios Interceptor for Token Refresh
const addRefreshInterceptor = (apiInstance: any) => {
  apiInstance.interceptors.response.use(
    (response: { data: any; status: number; headers: any }) => response,
    async (error: any) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        console.log("Calling refresh token due to 401", { cookies: document.cookie });
        const newToken = await refreshToken();
        if (!newToken) {
          console.error("Refresh token failed, clearing auth");
          throw new Error("Failed to refresh token");
        }
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return apiInstance(originalRequest);
      }
      return Promise.reject(error);
    }
  );
};

// Apply interceptors
[userApi, providerApi, deezerApi].forEach(addRefreshInterceptor); // Only user-related APIs

// Refresh Token (for users)
export const refreshToken = async (): Promise<string | null> => {
  try {
    const refreshTokenValue = getCookie("refreshToken");
    console.log("User refresh token:", refreshTokenValue);
    if (!refreshTokenValue) throw new Error("No refresh token available");

    const response = await userApi.post("/refresh", { refreshToken: refreshTokenValue }, { withCredentials: true });
    console.log("Refresh response:", response.data);
    const data = response.data as { success: boolean; token: string; message?: string };
    if (!data.success) throw new Error(data.message || "Failed to refresh token");

    localStorage.setItem("token", data.token);
    console.log("New user token:", data.token);
    return data.token;
  } catch (error) {
    console.error("Refresh error:", error);
    localStorage.removeItem("token");
    document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    return null;
  }
};

// Generic API Call Helper
const apiCall = async <T>(
  instance: any,
  method: "get" | "post" | "put" | "delete",
  url: string,
  data?: any,
  token?: string
): Promise<T> => {
  try {
    const response = await instance[method](url, data, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      withCredentials: true,
    });
    if (!response.data) throw new Error(`Failed to ${method} ${url}`);
    return response.data as T;
  } catch (error: any) {
    console.error(`Error in ${method} ${url}:`, error);
    throw error;
  }
};

// Check Username Availability
export const checkUsername = async (username: string): Promise<boolean> => {
  const data = await apiCall<{ available: boolean }>(userApi, "post", "/checkUsername", { userName: username });
  return data.available;
};

// Send OTP
export const sendOtp = async (email: string): Promise<void> => {
  const data = await apiCall<{ success: boolean; message?: string }>(userApi, "post", "/send-otp", { email });
  if (!data.success) throw new Error(data.message || "Failed to send OTP");
};

// Verify OTP
export const verifyOtp = async (otp: string): Promise<void> => {
  const data = await apiCall<{ success: boolean; message?: string }>(userApi, "post", "/verify-otp", { otp });
  if (!data.success) throw new Error(data.message || "Failed to verify OTP");
};

// Register User
export const registerUser = async (signupData: {
  username: string;
  country: string;
  gender: string;
  year: string;
  phone: string;
  email: string;
  password?: string;
  confirmPassword?: string;
}): Promise<void> => {
  const data = await apiCall<{ success: boolean; token?: string; user?: any; message?: string }>(
    userApi,
    "post",
    "/register",
    signupData
  );
  if (!data.success) throw new Error(data.message || "Failed to register user");
  if (data.token) localStorage.setItem("token", data.token);
};

// Login with email and password
export const loginUser = async (
  email: string,
  password: string,
  dispatch: ReturnType<typeof useDispatch>
): Promise<void> => {
  const data = await apiCall<{ token: string; user: any }>(userApi, "post", "/login", { email, password });
  console.log("Login response:", data);
  console.log("Refresh token after login:", getCookie("refreshToken"));
  localStorage.setItem("token", data.token);
  dispatch(saveSignupData(data.user));
};

// Google Login
export const googleLogin = async (
  idToken: string,
  dispatch: ReturnType<typeof useDispatch>
): Promise<void> => {
  const data = await apiCall<{ success: boolean; token: string; user: any; message?: string }>(
    userApi,
    "post",
    "/google-login",
    { token: idToken }
  );
  console.log("Google login response:", data);
  if (data.success) {
    localStorage.setItem("token", data.token);
    dispatch(saveSignupData(data.user));
  } else {
    throw new Error(data.message || "Google login failed");
  }
};

// Fetch all tracks (premium or free)
export const fetchTracks = async (
  userId: string,
  token: string,
  isPremium: boolean
): Promise<{ tracks: Track[]; user?: any }> => {
  const instance = isPremium ? providerApi : deezerApi;
  const url = isPremium ? `/getAllTracks?userId=${userId}` : `/songs/deezer?userId=${userId}`;
  console.log("Fetching tracks with:", { url, token, isPremium });
  const data = await apiCall<{ tracks?: any[]; songs?: any[]; user?: any }>(instance, "get", url, undefined, token);
  const tracks = (isPremium ? data.tracks : data.songs)?.map((track: any) => ({
    _id: track._id || track.fileUrl,
    title: track.title,
    album: track.album || "Unknown Album",
    artist: Array.isArray(track.artists)
      ? track.artists
      : track.artists
      ? JSON.parse(track.artists)
      : [track.artist || "Unknown Artist"],
    genre: Array.isArray(track.genre) ? track.genre[0] : track.genre || "Unknown Genre",
    fileUrl: track.fileUrl,
    img: track.img,
    listeners: track.listeners || 0,
  })) || [];
  return { tracks, user: data.user };
};

// Fetch liked songs
export const fetchLikedSongs = async (userId: string, token: string, songIds: string[]): Promise<Track[]> => {
  const data = await apiCall<{ success: boolean; tracks: any[] }>(
    userApi,
    "post",
    `/getliked?userId=${userId}`,
    { songIds },
    token
  );
  if (!data.success) throw new Error("Failed to fetch liked songs details");
  return data.tracks.map((song: any) => ({
    _id: song._id,
    title: song.title,
    artist: Array.isArray(song.artists) ? song.artists : [song.artists || "Unknown Artist"],
    fileUrl: song.fileUrl,
    img: song.img,
    album: song.album || "Unknown Album",
    genre: Array.isArray(song.genre) ? song.genre[0] : song.genre || "Unknown Genre",
    listeners: song.listeners || 0,
  }));
};

// Increment listeners
export const incrementListeners = async (trackId: string, token: string): Promise<void> => {
  console.log("Incrementing listeners:", { trackId, token });
  const data = await apiCall<{ success: boolean }>(artistApi, "post", "/incrementListeners", { trackId }, token);
  if (!data.success) throw new Error("Failed to increment listeners");
};

// Toggle like
export const toggleLike = async (userId: string, trackId: string, token: string): Promise<any> => {
  const data = await apiCall<{ success: boolean; user?: any }>(
    userApi,
    "post",
    `/toggle-like?userId=${userId}`,
    { trackId },
    token
  );
  if (!data.success) throw new Error("Failed to toggle like");
  return data.user;
};

// Upload profile image
export const uploadProfileImage = async (userId: string, base64Image: string, token: string): Promise<any> => {
  const blob = await (await fetch(base64Image)).blob();
  const formData = new FormData();
  formData.append("profileImage", blob, "cropped-image.jpg");
  formData.append("userId", userId);
  const data = await apiCall<{ success: boolean; user?: any }>(userApi, "post", "/uploadProfilepic", formData, token);
  if (!data.success || !data.user) throw new Error("Failed to upload profile picture");
  return data.user;
};

// export default {
//   checkUsername,
//   sendOtp,
//   verifyOtp,
//   registerUser,
//   loginUser,
//   googleLogin,
//   fetchTracks,
//   fetchLikedSongs,
//   incrementListeners,
//   toggleLike,
//   uploadProfileImage,
// };