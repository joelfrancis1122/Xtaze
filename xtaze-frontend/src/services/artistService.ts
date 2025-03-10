import { useDispatch } from "react-redux";
import { artistApi, userApi } from "../api/axios";
import { saveArtistData } from "../redux/artistSlice";

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
        console.log("Calling artist refresh token due to 401", { cookies: document.cookie });
        const newToken = await refreshToken();
        if (!newToken) {
          console.error("Artist refresh token failed, clearing auth");
          throw new Error("Failed to refresh token");
        }
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return apiInstance(originalRequest);
      }
      return Promise.reject(error);
    }
  );
};

// Apply interceptor to artistApi and userApi
addRefreshInterceptor(artistApi);
addRefreshInterceptor(userApi);

// Refresh Token (specific to artist)
export const refreshToken = async (): Promise<string | null> => {
  try {
    const refreshTokenValue = getCookie("ArefreshToken");
    console.log("Artist refresh token:", refreshTokenValue);
    if (!refreshTokenValue) {
      console.error("No artist refresh token found, redirecting to login");
      localStorage.removeItem("ArefreshToken");
      document.cookie = "artistRefreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = "/login";
      return null;
    }

    const response = await artistApi.post("/refresh", { ArefreshToken: refreshTokenValue }, { withCredentials: true });
    console.log("Artist refresh response:", response.data);
    const data = response.data as { success: boolean; token: string; message?: string };
    if (!data.success) throw new Error(data.message || "Failed to refresh token");
    localStorage.setItem("artistToken", data.token);
    console.log("New artist token:", data.token);
    return data.token;
  } catch (error) {
    console.error("Artist refresh error:", error);
    // localStorage.removeItem("artistToken");
    // document.cookie = "artistRefreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // window.location.href = "/login";
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

// Artist Login
export const loginArtist = async (
  email: string,
  password: string,
  dispatch: ReturnType<typeof useDispatch>
): Promise<void> => {
  const data = await apiCall<{ success: boolean; token: string; artist: any; message?: string }>(
    artistApi,
    "post",
    "/login",
    { email, password }
  );
  if (!data.success) throw new Error(data.message || "Failed to login artist");
  console.log("Login response:", data);
  console.log("Refresh token after login:", getCookie("artistRefreshToken"));
  localStorage.setItem("artistToken", data.token);
  dispatch(saveArtistData(data.artist));
};

// Fetch Artist Tracks
export const fetchArtistTracks = async (artistId: string, token: string): Promise<any[]> => {
  console.log("Fetching artist tracks with:", { artistId, token });
  const data = await apiCall<{ success: boolean; tracks: any[]; message?: string }>(
    artistApi,
    "get",
    `/getAllTracksArtist?userId=${artistId}`,
    undefined,
    token
  );
  if (!data.success) throw new Error(data.message || "Failed to fetch artist tracks");
  return data.tracks;
};

// Fetch Active Genres
export const fetchActiveGenres = async (artistId: string, token: string): Promise<{ artist: any; genres: IGenre[] }> => {
  console.log("Fetching active genres with:", { artistId, token });
  const data = await apiCall<{ success: boolean; data: IGenre[]; artist: any; message?: string }>(
    artistApi,
    "get",
    `/listActiveGenres?artistId=${artistId}`,
    undefined,
    token
  );
  if (!data.success) throw new Error(data.message || "Failed to fetch genres");
  return { genres: data.data, artist: data.artist };
};

// Upload Song
export const uploadSong = async (
  songData: {
    songName: string;
    artist: string;
    genre: string;
    album: string;
    image: File | null;
    song: File | null;
  },
  token: string
): Promise<any> => {
  console.log("Uploading song with:", { songData, token });
  const formData = new FormData();
  formData.append("songName", songData.songName);
  formData.append("artist", songData.artist);
  formData.append("genre", songData.genre);
  formData.append("album", songData.album);
  if (songData.image) formData.append("image", songData.image);
  if (songData.song) formData.append("file", songData.song);

  const data = await apiCall<{ success: boolean; message?: string }>(
    artistApi,
    "post",
    "/upload",
    formData,
    token
  );
  if (!data.success) throw new Error(data.message || "Failed to upload song");
  return data;
};

// Upload Profile Image
export const uploadProfileImage = async (artistId: string, base64Image: string, token: string): Promise<any> => {
  const blob = await (await fetch(base64Image)).blob();
  const formData = new FormData();
  formData.append("profileImage", blob, "artist-profileImage.jpg");
  formData.append("userId", artistId);

  const data = await apiCall<{ success: boolean; user?: any; message?: string }>(
    userApi,
    "post",
    "/uploadProfilepic",
    formData,
    token
  );
  if (!data.success || !data.user) throw new Error(data.message || "Failed to upload profile picture");
  return data.user;
};

// Update Artist Banner
export const updateArtistBanner = async (artistId: string, base64Banner: string, token: string): Promise<any> => {
  const blob = await (await fetch(base64Banner)).blob();
  const formData = new FormData();
  formData.append("coverImage", blob, `artist-coverImage.${blob.type.startsWith("video/") ? "mp4" : "jpg"}`);
  formData.append("userId", artistId);

  const data = await apiCall<{ success: boolean; user?: any; message?: string }>(
    userApi,
    "post",
    "/updateBanner",
    formData,
    token
  );
  if (!data.success || !data.user) throw new Error(data.message || "Failed to update banner");
  return data.user;
};

// Update Artist Bio
export const updateArtistBio = async (artistId: string, bio: string, token: string): Promise<any> => {
  console.log("Updating artist bio with:", { artistId, token });
  const data = await apiCall<{ success: boolean; user?: any; message?: string }>(
    userApi,
    "put",
    "/updateBio",
    { userId: artistId, bio },
    token
  );
  if (!data.success || !data.user) throw new Error(data.message || "Failed to update bio");
  return data.user;
};

export default {
  loginArtist,
  fetchArtistTracks,
  fetchActiveGenres,
  uploadSong,
  uploadProfileImage,
  updateArtistBio,
  updateArtistBanner,
};

// Genre interface (for TypeScript)
export interface IGenre {
  _id: string;
  name: string;
  isBlocked: boolean;
  createdAt: string;
  __v: number;
}