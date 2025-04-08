import { useDispatch } from "react-redux";
import { artistApi, userApi } from "../api/axios";
import { saveArtistData } from "../redux/artistSlice";

// Simplified Axios Interceptor for Token Refresh
const addRefreshInterceptor = (apiInstance: any) => {
  apiInstance.interceptors.response.use(
    (response: { data: any; status: number; headers: any }) => {
      // Update token if returned in response
      const newToken = response.data?.token || response.headers["authorization"]?.replace("Bearer ", "");
      if (newToken) {
        localStorage.setItem("artistToken", newToken); // Use artistToken specifically
        console.log("Updated artist token in localStorage:", newToken);
      }
      return response;
    },
    async (error: any) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        console.log("Calling artist refresh token due to 401");

        // Trigger refresh without sending refreshToken (backend handles it)
        const response = await artistApi.post("/refresh", {}, { withCredentials: true });
        const newToken = response.data.token;
        if (!newToken) {
          console.error("Artist refresh token failed, clearing auth");
          localStorage.removeItem("artistToken");
          throw new Error("Failed to refresh token");
        }

        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return apiInstance(originalRequest);
      }
      return Promise.reject(error);
    }
  );
};

// Apply interceptor to artistApi
addRefreshInterceptor(artistApi);

// Refresh Token (specific to artist)
export const refreshToken = async (): Promise<string | null> => {
  try {
    console.log("Attempting to refresh artist token...");
    const response = await artistApi.post("/refresh", {}, { withCredentials: true });
    const newToken = response.data.token;
    if (newToken) {
      localStorage.setItem("artistToken", newToken);
      console.log("New artist token:", newToken);
      return newToken;
    }
    return null;
  } catch (error) {
    console.error("Artist refresh error:", error);
    localStorage.removeItem("artistToken");
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

export const checkCardStatus = async (artistId: string, token: string): Promise<boolean> => {
  console.log("Checking card status with:", { artistId, token });
  const data = await apiCall<{ data: { stripePaymentMethodId: string } }>(
    artistApi,
    "get",
    `/checkcard?userId=${artistId}`,
    undefined,
    token
  );
  console.log("Card status response:", data);
  return !!data.data.stripePaymentMethodId; // Returns true if stripePaymentMethodId exists
};

export const saveCard = async (artistId: string, paymentMethodId: string, token: string): Promise<void> => {
  console.log("Saving card with:", { artistId, paymentMethodId, token });
  const data = await apiCall<{ success: boolean; message?: string }>(
    artistApi,
    "post",
    "/saveCard",
    { artistId, paymentMethodId },
    token
  );
  if (!data.success) throw new Error(data.message || "Failed to save card");
};

export const fetchSongEarnings = async (artistId: string, token: string): Promise<any[]> => {
  console.log("Fetching song earnings with:", { artistId, token });
  const data = await apiCall<{ data: any[] }>(
    artistApi,
    "get",
    `/statsOfArtist?userId=${artistId}`,
    undefined,
    token
  );
  console.log("Song earnings response:", data.data);
  return data.data.map((song: any) => ({
    trackId: song.trackId,
    trackName: song.trackName,
    totalPlays: song.totalPlays,
    monthlyPlays: song.monthlyPlays,
    totalEarnings: song.totalPlays * 0.50, // Assuming revenuePerPlay = 0.50
    monthlyEarnings: song.monthlyPlays * 0.50,
  }));
};
export default {
  loginArtist,
  fetchArtistTracks,
  fetchActiveGenres,
  uploadSong,
  uploadProfileImage,
  updateArtistBio,
  updateArtistBanner,
  refreshToken,
};

// Genre interface (for TypeScript)
export interface IGenre {
  _id: string;
  name: string;
  isBlocked: boolean;
  createdAt: string;
  __v: number;
}