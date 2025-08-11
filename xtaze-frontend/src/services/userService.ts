import { useDispatch } from "react-redux";
import { adminApi, artistApi, deezerApi, providerApi, userApi } from "../api/axios";
import { Track } from "../pages/User/types/ITrack";
import { saveSignupData } from "../redux/userSlice";
import { Playlist } from "../pages/User/types/IPlaylist";
import { IBanner } from "../pages/User/types/IBanner";
import { Artist } from "../pages/User/types/IArtist";
import { UserSignupData } from "../pages/User/types/IUser";
import { HTTP_METHODS } from "../constants/httpMethods";
import { IAlbum } from "../pages/User/types/IAlbums";

const addRefreshInterceptor = (apiInstance: any) => {
  apiInstance.interceptors.response.use(
    (response: { data: any; status: number; headers: any }) => {
      const newToken = response.data?.token || response.headers["authorization"]?.replace("Bearer ", "");
      if (newToken) {
        localStorage.setItem("token", newToken);
      }
      return response;
    },
    async (error: any) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        const response = await userApi.post("/refresh", {}, { withCredentials: true });
        const newToken = response.data.token;
        if (!newToken) {
          console.error("Refresh token failed, clearing auth");
          localStorage.removeItem("token");
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

// Refresh Token
export const refreshToken = async (): Promise<string | null> => {
  try {
    const response = await userApi.post("/refresh", {}, { withCredentials: true });
    const newToken = response.data.token;
    if (newToken) {
      localStorage.setItem("token", newToken);
      return newToken;
    }
    return null;
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
  method: typeof HTTP_METHODS[keyof typeof HTTP_METHODS],
  url: string,
  data?: any,
  token?: string
): Promise<T> => {
  try {
    const config = {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      withCredentials: true,
    };
    const response = method === "get"
      ? await instance[method](url, config)
      : await instance[method](url, data, config);
    if (!response.data) throw new Error(`Failed to ${method} ${url}`);
    return response.data as T;
  } catch (error: any) {
    console.error(`Error in ${method} ${url}:`, error);
    throw error;
  }
};
export const checkUsername = async (username: string): Promise<boolean> => {
  const data = await apiCall<{ success: boolean; available: boolean }>(userApi, HTTP_METHODS.POST, "/checkUsername", { userName: username });
  if (!data.success) throw new Error("Failed to check username");
  return data.available;
};

// Send OTP
export const sendOtp = async (email: string): Promise<void> => {
  const data = await apiCall<{ success: boolean; message?: string }>(userApi, HTTP_METHODS.POST, "/send-otp", { email });
  if (!data.success) throw new Error(data.message || "Failed to send OTP");
};

// Verify OTP
export const verifyOtp = async (otp: string): Promise<void> => {
  const data = await apiCall<{ success: boolean; message?: string }>(userApi, HTTP_METHODS.POST, "/verify-otp", { otp });
  if (!data.success) throw new Error(data.message || "Failed to verify OTP");
};

// Register User
export const registerUser = async (
  signupData: { username: string; country: string; gender: string; year: string; phone: string; email: string; password?: string; confirmPassword?: string },
  dispatch: ReturnType<typeof useDispatch>
): Promise<void> => {
  const data = await apiCall<{ success: boolean; user?: UserSignupData; message?: string }>(
    userApi,
    HTTP_METHODS.POST,
    "/register",
    signupData
  );
  if (!data.success) throw new Error(data.message || "Failed to register user");
  if (data.user) dispatch(saveSignupData(data.user));
};

// Login User
export const loginUser = async (email: string, password: string, dispatch: ReturnType<typeof useDispatch>): Promise<void> => {
  const data = await apiCall<{ success: boolean; token: string; user: UserSignupData }>(userApi, HTTP_METHODS.POST, "/login", { email, password });
  if (!data.success) throw new Error("Failed to login");
  localStorage.setItem("token", data.token);
  dispatch(saveSignupData(data.user));
};

// Google Login
export const googleLogin = async (idToken: string, dispatch: ReturnType<typeof useDispatch>): Promise<void> => {
  const data = await apiCall<{ success: boolean; token: string; user: UserSignupData; message?: string }>(
    userApi,
    HTTP_METHODS.POST,
    "/google-login",
    { token: idToken }
  );
  if (!data.success) throw new Error(data.message || "Google login failed");
  localStorage.setItem("token", data.token);
  dispatch(saveSignupData(data.user));
};

// Fetch Tracks
export const fetchTracks = async (userId: string, isPremium: string): Promise<{ tracks: Track[]; user?: UserSignupData }> => {
  const instance = isPremium !== "Free" ? providerApi : deezerApi;
  const url = isPremium !== "Free" ? `/getAllTracks?userId=${userId}` : `/songs/deezer?userId=${userId}`;
  const data = await apiCall<{ success: boolean; tracks?: Track[]; songs?: Track[]; user?: UserSignupData }>(instance, HTTP_METHODS.GET, url);
  // if (!data.success) throw new Error("Failed to fetch tracks");
  const tracks = (isPremium !== "Free" ? data.tracks : data.songs) || [];
  return { tracks, user: data.user };
};

// Fetch All Tracks
export const fetchAllTrack = async (): Promise<Track[]> => {
  const data = await apiCall<{ success: boolean; data: Track[] }>(userApi, HTTP_METHODS.GET, "/fetchAllTrack");
  // if (!data.success) throw new Error("Failed to fetch all tracks");
  return data.data;
};

// Fetch Genre Tracks
export const fetchGenreTracks = async (genre: string): Promise<Track[]> => {
  const data = await apiCall<{ success: boolean; data: Track[] }>(userApi, HTTP_METHODS.GET, `/fetchGenreTracks?GenreName=${genre}`);
  // if (!data.success) throw new Error("Failed to fetch genre tracks");
  return data.data;
};

// Fetch Liked Songs
export const fetchLikedSongs = async (userId: string, songIds: string[]): Promise<Track[]> => {
  const data = await apiCall<{ success: boolean; tracks: Track[] }>(
    userApi,
    HTTP_METHODS.POST,
    `/getliked?userId=${userId}`,
    { songIds }
  );
  if (!data.success) throw new Error("Failed to fetch liked songs");
  return data.tracks;
};

// Increment Listeners
export const incrementListeners = async (trackId: string, id: string): Promise<void> => {
  console.log("get in")
  const data = await apiCall<{ success: boolean }>(artistApi, HTTP_METHODS.POST, "/incrementListeners", { trackId, id });
  if (!data.success) throw new Error("Failed to increment listeners");
};

// Toggle Like
export const toggleLike = async (userId: string, trackId: string): Promise<UserSignupData> => {
  const data = await apiCall<{ success: boolean; user: UserSignupData }>(
    userApi,
    HTTP_METHODS.POST,
    `/toggle-like?userId=${userId}`,
    { trackId }
  );
  if (!data.success) throw new Error("Failed to toggle like");
  return data.user;
};

// Upload Profile Image
export const uploadProfileImage = async (userId: string, base64Image: string): Promise<UserSignupData> => {
  const blob = await (await fetch(base64Image)).blob();
  const formData = new FormData();
  formData.append("profileImage", blob, "cropped-image.jpg");
  formData.append("userId", userId);
  const data = await apiCall<{ success: boolean; user: UserSignupData }>(userApi, HTTP_METHODS.POST, "/uploadProfilepic", formData);
  if (!data.success) throw new Error("Failed to upload profile picture");
  return data.user;
};

// Forgot Password
export const forgotPassword = async (email: string): Promise<void> => {
  const data = await apiCall<{ success: boolean; message?: string }>(userApi, HTTP_METHODS.POST, "/forgotPassword", { email });
  if (!data.success) throw new Error(data.message || "Failed to send reset email");
};

// Reset Password
export const resetPassword = async (formData: string): Promise<void> => {
  const data = await apiCall<{ success: boolean; message?: string }>(userApi, HTTP_METHODS.POST, "/resetPassword", { formData });
  if (!data.success) throw new Error(data.message || "Failed to reset password");
};

// Create Playlist
export const createPlaylists = async (userId: string, playlistData: Partial<Playlist>): Promise<Playlist> => {
  const data = await apiCall<{ success: boolean; data: Playlist }>(userApi, HTTP_METHODS.POST, "/createPlaylist", { userId, playlist: playlistData });
  if (!data.success) throw new Error("Failed to create playlist");
  return data.data;
};

// Get My Playlists
export const getMyplaylist = async (userId: string): Promise<Playlist[]> => {
  const data = await apiCall<{ success: boolean; data: Playlist[] }>(userApi, HTTP_METHODS.GET, `/getPlaylist?userId=${userId}`);
  if (!data.success) throw new Error("Failed to get playlists");
  return data.data;
};
export const getMyAlbums = async (): Promise<IAlbum[]> => {
  const data = await apiCall<{ success: boolean; data: IAlbum[] }>(userApi, HTTP_METHODS.GET, `/albums`);
  // if (!data.success) throw new Error("Failed to get Albums");
  return data.data;
};
export const fetchAlbumSongs = async (albumId:string): Promise<IAlbum> => {
  const data = await apiCall<{ success: boolean; data: IAlbum }>(userApi, HTTP_METHODS.GET, `/albumsongs?albumId=${albumId}`
  );
  // if (!data.success) throw new Error("Failed to get Albums");
  return data.data;
};

// Fetch Playlist Tracks
export const fetchPlaylistTracks = async (id: string, page: number = 1, limit: number = 20): Promise<{ tracks: Track[]; total: number }> => {
  const data = await apiCall<{ success: boolean; data: { tracks: Track[]; total: number } }>(
    userApi,
    HTTP_METHODS.GET,
    `/getTracksInPlaylist?id=${id}&page=${page}&limit=${limit}`
  );
  if (!data.success) throw new Error("Failed to fetch playlist tracks");
  return data.data;
};

// Fetch Banners
export const fetchBanners = async (): Promise<IBanner[]> => {
  const data = await apiCall<{ success: boolean; data: IBanner[] }>(userApi, HTTP_METHODS.GET, "/banners");
  // if (!data.success) throw new Error("Failed to fetch banners");
  return data.data;
};

// Add Track to Playlist
export const addTrackToPlaylist = async (userId: string, playlistId: string, trackId: string): Promise<void> => {
  const data = await apiCall<{ success: boolean }>(userApi, HTTP_METHODS.POST, "/addToPlaylist", { userId, playlistId, trackId });
  if (!data.success) throw new Error("Failed to add track to playlist");
};

// Delete Playlist
export const deletePlaylist = async (id: string): Promise<void> => {
  const data = await apiCall<{ success: boolean }>(userApi, HTTP_METHODS.POST, "/deletePlaylist", { id });
  if (!data.success) throw new Error("Failed to delete playlist");
};

// Update Playlist Name
export const updatePlaylistName = async (id: string, playlistName: string): Promise<void> => {
  const data = await apiCall<{ success: boolean }>(userApi, HTTP_METHODS.PUT, "/updateNamePlaylist", { id, playlistName });
  if (!data.success) throw new Error("Failed to update playlist name");
};

// Become Artist
export const becomeArtist = async (id: string): Promise<UserSignupData> => {
  const data = await apiCall<{ success: boolean; data: UserSignupData }>(userApi, HTTP_METHODS.PUT, "/becomeArtist", { id });
  if (!data.success) throw new Error("Failed to become artist");
  return data.data;
};

// Update Playlist Image
export const updatePlaylistImage = async (id: string, file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("id", id);
  formData.append("imageUpload", file);
  const data = await apiCall<{ success: boolean; updated: string }>(userApi, HTTP_METHODS.PUT, "/updateImagePlaylist", formData);
  if (!data.success) throw new Error("Failed to update playlist image");
  return data.updated || "";
};

// Initiate Checkout
export const initiateCheckout = async (userId: string, priceId: string, code: string): Promise<string> => {
  const data = await apiCall<{ success: boolean; sessionId: string }>(userApi, HTTP_METHODS.POST, "/checkOut", { userId, priceId, code });
  if (!data.success) throw new Error("Failed to initiate checkout");
  return data.sessionId;
};

// Fetch Plans
export const fetchPlans = async (): Promise<string> => {
  const data = await apiCall<{ success: boolean; sessionId: string }>(adminApi, HTTP_METHODS.GET, "/stripe/plans");
  if (!data.success) throw new Error("Failed to fetch plans");
  return data.sessionId;
};

// Fetch Pricing Plans
export const fetchPricingPlans = async (): Promise<any[]> => {
  const data = await apiCall<{ success: boolean; data: any[] }>(adminApi, HTTP_METHODS.GET, "/stripe/plans");
  if (!data.success) throw new Error("Failed to fetch pricing plans");
  return data.data.map((plan: any) => ({
    name: plan.product.name,
    price: plan.price.unit_amount / 100,
    period: plan.price.recurring?.interval || "month",
    features: ["Full-length songs", "High-quality FLAC", "Offline playback", "Exclusive content"],
    priceId: plan.price.id,
    featured: true,
  }));
};

// Verify Coupon
export const verifyCoupon = async (code: string): Promise<any> => {
  const data = await apiCall<{ success: boolean; data: any }>(adminApi, HTTP_METHODS.POST, "/coupons/verify", { code });
  if (!data.success) throw new Error("Failed to verify coupon");
  return data.data;
};

// Fetch Artists
export const fetchArtists = async (): Promise<Artist[]> => {
  const data = await apiCall<{ success: boolean; data: any[] }>(userApi, HTTP_METHODS.GET, "/listArtists");
  if (!data.success) throw new Error("Failed to fetch artists");
  return data.data.map((artist: any) => ({
    id: artist._id,
    name: artist.username,
    role: artist.role,
    image: artist.profilePic,
    isActive: artist.isActive ? true : false,
  }));
};

// Fetch Artist Tracks
export const fetchArtistTracks = async (artistId: string): Promise<Track[]> => {
  const data = await apiCall<{ success: boolean; tracks: Track[] }>(userApi, HTTP_METHODS.GET, `/getAllTracksArtist?userId=${artistId}`);
  if (!data.success) throw new Error("Failed to fetch artist tracks");
  return data.tracks;
};

// Fetch User by Username
export const fetchUserByUsername = async (username: string): Promise<any> => {
  const data = await apiCall<{ success: boolean; data: UserSignupData }>(userApi, HTTP_METHODS.GET, `/username?userId=${username}`);
  return data.data;
  // if (!data.success) throw new Error("Failed to fetch user");
};

// Fetch All Artists Verification
export const fetchAllArtistsVerification = async (): Promise<any> => {
  const data = await apiCall<{ success: boolean; data: any }>(userApi, HTTP_METHODS.GET, "/fetchAllArtistsVerification");
  if (!data.success) throw new Error("Failed to fetch artist verifications");
  return data.data;
};

// Update Username
export const updateUsername = async (id: string, name: string): Promise<UserSignupData> => {
  const data = await apiCall<{ success: boolean; data: UserSignupData }>(userApi, HTTP_METHODS.PUT, `/usersName?id=${id}`, { username: name });
  if (!data.success) throw new Error("Failed to update username");
  return data.data;
};