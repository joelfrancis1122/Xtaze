import { useDispatch } from "react-redux";
import { adminApi, artistApi, deezerApi, providerApi, userApi } from "../api/axios";
import { Track } from "../pages/User/types/ITrack";
import { saveSignupData } from "../redux/userSlice";
import { Playlist } from "../pages/User/types/IPlaylist";
import { IBanner } from "../pages/User/types/IBanner";
import { Artist } from "./adminService";

// Utility to get cookies

// Simplified Axios Interceptor for Token Refresh
const addRefreshInterceptor = (apiInstance: any) => {
  apiInstance.interceptors.response.use(
    (response: { data: any; status: number; headers: any }) => {
      // Update token if returned in response
      const newToken = response.data?.token || response.headers["authorization"]?.replace("Bearer ", "");
      if (newToken) {
        localStorage.setItem("token", newToken);
        console.log("Updated token in localStorage:", newToken);
      }
      return response;
    },
    async (error: any) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        console.log("Calling refresh token due to 401", { cookies: document.cookie });

        // Trigger refresh without sending refreshToken (backend handles it)
        const response = await userApi.post("/refresh", {}, { withCredentials: true });
        const newToken = response.data.token;
        if (!newToken) {
          console.error("Refresh token failed, clearing auth");
          localStorage.removeItem("token");
          document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
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
    const response = await userApi.post("/refresh", {}, { withCredentials: true });
    const newToken = response.data.token;
    if (newToken) {
      localStorage.setItem("token", newToken);
      console.log("New user token:", newToken);
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
  method: "get" | "post" | "put" | "delete" | "patch",
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
  // console.log("Refresh token after login:", getCookie("refreshToken"));
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
  isPremium: string
): Promise<{ tracks: Track[]; user?: any }> => {
  const instance = isPremium !== "Free" ? providerApi : deezerApi;
  const url = isPremium !== "Free" ? `/getAllTracks?userId=${userId}` : `/songs/deezer?userId=${userId}`;
  console.log("Fetching tracks with:", { url, token, isPremium });
  const data = await apiCall<{ tracks?: any[]; songs?: any[]; user?: any }>(instance, "get", url, undefined, token);
  const tracks = (isPremium !== "Free" ? data.tracks : data.songs)?.map((track: any) => ({
    _id: track._id || track.fileUrl,
    title: track.title,
    album: track.album || "Unknown Album",
    artists: Array.isArray(track.artists)
      ? track.artists
      : track.artists
        ? JSON.parse(track.artists)
        : [track.artist || "Unknown Artist"],
    genre: Array.isArray(track.genre) ? track.genre[0] : track.genre || "Unknown Genre",
    fileUrl: track.fileUrl,
    img: track.img,
    listeners: track.listeners || [],
    playHistory: track.playHistory || [],
  })) || [];
  return { tracks, user: data.user };
};

// Fetch liked songs
export const fetchAllTrack = async (): Promise<Track[]> => {
  const data = await apiCall<{ success: boolean; data: Track[] }>(
    userApi,
    "get",
    `/fetchAllTrack`,
  );
  console.log(data, "liliiiii")
  return data.data
};

export const fetchGenreTracks = async (genre: string): Promise<Track[]> => {
  console.log(genre, "alhildas")
  const data = await apiCall<{ success: boolean; data: Track[] }>(
    userApi,
    "get",
    `/fetchGenreTracks?GenreName=${genre}`,
  );
  console.log(data, "ambu")
  return data.data
};


export const fetchLikedSongs = async (userId: string, token: string, songIds: string[]): Promise<Track[]> => {
  const data = await apiCall<{ success: boolean; tracks: Track[] }>(
    userApi,
    "post",
    `/getliked?userId=${userId}`,
    { songIds },
    token
  );
  if (!data.success) throw new Error("Failed to fetch liked songs details");
  return data.tracks
};

// Increment listeners
export const incrementListeners = async (trackId: string, token: string,id:string): Promise<void> => {
  console.log("Incrementing listeners:", { trackId, token,id });
  const data = await apiCall<{ success: boolean }>(artistApi, "post", "/incrementListeners", { trackId,id }, token);
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

export const forgotPassword = async (email: string): Promise<void> => {
  const data = await apiCall<{ success: boolean; message?: string }>(
    userApi,
    "post",
    "/forgotPassword",
    { email }
  );
  if (!data.success) throw new Error(data.message || "Failed to send reset email");
};
export const resetPassword = async (token: string, formData: string): Promise<void> => {
  const data = await apiCall<{ success: boolean; message?: string }>(
    userApi,
    "post",
    "/resetPassword",
    { token, formData }
  );
  if (!data.success) throw new Error(data.message || "Failed to send reset email");
};

export const createPlaylists = async (userId: string, playlistData: Partial<Playlist>): Promise<Playlist> => {
  const data = await apiCall<{ success: boolean; data: Playlist; message?: string }>(
    userApi,
    "post",
    "/createPlaylist",
    { userId, playlist: playlistData }
  );
  if (!data.success) throw new Error(data.message || "Failed to create playlist");
  console.log(data, "from user service createplaylist")
  return data.data;
};
export const getMyplaylist = async (userId: string): Promise<Playlist[]> => {
  console.log(userId, "odi odi o ds");
  const data = await apiCall<{ success: boolean; message?: string; data: Playlist[] }>(
    userApi,
    "get",
    `/getPlaylist?userId=${userId}`
  );
  if (!data.success) throw new Error(data.message || "Failed to get all playlists");
  console.log(data);
  return data.data;
};


export const fetchPlaylistTracks = async (id: string, page: number = 1, limit: number = 20): Promise<{ tracks: Track[]; total: number }> => {
  console.log(id, "Fetching tracks with pagination", { page, limit });
  const data = await apiCall<{ success: boolean; message?: string; data: { tracks: Track[]; total: number } }>(
    userApi,
    "get",
    `/getTracksInPlaylist?id=${id}&page=${page}&limit=${limit}`,

  );
  // if (!data.success) throw new Error(data.message || "Failed to fetch playlist tracks");
  console.log(data, "Playlist tracks response");
  return data.data;
};

export const fetchBanners = async (): Promise<IBanner[]> => {
  const data = await apiCall<{ success: boolean; message?: string; data: IBanner[] }>(
    userApi,
    "get",
    `/banners`
  );
  console.log(data, "ithan sanam");
  return data.data;
  if (!data.success) throw new Error(data.message || "Failed to get all playlists");
};



export const addTrackToPlaylist = async (
  userId: string,
  playlistId: string,
  trackId: string,
  token: string
): Promise<void> => {
  const data = await apiCall<{ success: boolean; message?: string }>(
    userApi,
    "post",
    "/addToPlaylist",
    { userId, playlistId, trackId },
    token
  );
  if (!data.success) throw new Error(data.message || "Failed to add track to playlist");
};
export const deletePlaylist = async (
  id: string,

): Promise<void> => {
  const data = await apiCall<{ success: boolean; message?: string }>(
    userApi,
    "post",
    "/deletePlaylist",
    { id },
  );
  if (!data.success) throw new Error(data.message || "Failed to add track to playlist");
};
export const updatePlaylistName = async (
  id: string, playlistName: string
): Promise<void> => {
  const data = await apiCall<{ success: boolean; message?: string }>(
    userApi,
    "put",
    "/updateNamePlaylist",
    { id, playlistName },
  );
  if (!data.success) throw new Error(data.message || "Failed to add track to playlist");
};

export const becomeArtist = async (
  id: string,
): Promise<void> => {
  const data = await apiCall<{ success: boolean; message?: string, data:any }>(
    userApi,
    "put",
    "/becomeArtist",
    { id},
  );
  return data.data
  // if (!data.success) throw new Error(data.message || "Failed to add track to playlist");
};

export const updatePlaylistImage = async (id: string, file: File): Promise<any> => {
  const formData = new FormData();
  formData.append("id", id);
  formData.append("imageUpload", file);

  const data = await apiCall<{ success: boolean; updated?: string; message?: string }>(
    userApi,
    "put",
    "/updateImagePlaylist",
    formData,
  );

  if (!data.success) throw new Error(data.message || "Failed to update playlist image");
  console.log(data)
  return data?.updated || "";
};

export const initiateCheckout = async (
  userId: string,
  priceId: string,
  code: string
): Promise<string> => {
  console.log(code, "krishhh")
  const data = await apiCall<{ sessionId: string }>(
    userApi,
    "post",
    "/checkOut",
    { userId, priceId, code }
  );
  console.log("Checkout response:", data);
  return data.sessionId;
};
export const fetchPlans = async (): Promise<string> => {
  const data = await apiCall<{ sessionId: string }>(
    adminApi,
    "get",
    "/stripe/plans",
  );
  console.log("Checkout response:", data);
  return data.sessionId;
};

export const fetchPricingPlans = async (): Promise<any[]> => {
  console.log("Fetching pricing plans...");
  try {
    const data = await apiCall<{ data: any[] }>(
      adminApi, // Use adminApi for admin endpoints
      "get",
      "/stripe/plans",
      undefined,
    );
    console.log("Pricing plans response:", data);
    return data.data.map((plan: any) => ({
      name: plan.product.name,
      price: plan.price.unit_amount / 100,
      period: plan.price.recurring?.interval || "month",
      features: ["Full-length songs", "High-quality FLAC", "Offline playback", "Exclusive content"],
      priceId: plan.price.id,
      featured: true,
    }));
  } catch (error: any) {
    console.error("Error fetching pricing plans:", error);
    throw new Error(error.message || "Failed to fetch pricing plans");
  }
};

export const verifyCoupon = async (code: string, token?: string): Promise<any> => {
  console.log("Verifying coupon:", code);
  try {
    const data = await apiCall<{ data: any }>(
      adminApi, // Use adminApi for admin endpoints
      "post",
      "/coupons/verify",
      { code },
      token
    );
    console.log("Coupon verification response:", data);
    return data.data; // Return raw coupon data for component to validate
  } catch (error: any) {
    console.error("Coupon verification error:", error);
    throw new Error(error.response?.data?.message || "Failed to verify coupon");
  }
};
export const fetchArtists = async (token: string): Promise<Artist[]> => {
  console.log("Fetching artists with token:", token);
  try {
    const data = await apiCall<{ success: boolean; data: any[]; message?: string }>(
      userApi,
      "get",
      "/listArtists",
      undefined,
      token
    );
    console.log("Fetch artists response:", data);
    if (!data.success) throw new Error(data.message || "Failed to fetch artists");
    return data.data.map((artist: any) => ({
      id: artist._id,
      name: artist.username,
      role: artist.role,
      image: artist.profilePic,
      isActive: artist.isActive ? true : false,
    }));
  } catch (error) {
    console.error("Fetch artists error:", error);
    throw error;
  }
};

export const fetchArtistTracks = async (artistId: string, token: string): Promise<any[]> => {
  console.log("Fetching artist tracks with:", { artistId, token });
  const data = await apiCall<{ success: boolean; tracks: any[]; message?: string }>(
    userApi,
    "get",
    `/getAllTracksArtist?userId=${artistId}`,
    undefined,
    token
  );
  if (!data.success) throw new Error(data.message || "Failed to fetch artist tracks");
  return data.tracks;
};
export const fetchUserByUsername = async (username: string, token: string): Promise<any> => {
  console.log("testing complete",username)
  const data = await apiCall<{ success: boolean; tracks: any[]; data?: string }>(
    userApi,
    "get",
    `/username?userId=${username}`,
    undefined,
    token
  );
  console.log(data)
  // if (!data.success) throw new Error(data.message || "Failed to fetch artist tracks");
  return data.data;
};

export const fetchAllArtistsVerification = async (token:string): Promise<any> => {
  try {
    const response = await apiCall<{ data: any }>(
      userApi,
      "get",
      `/fetchAllArtistsVerification`,
      undefined,
      token
    );
    console.log(response,"ossss")
    return response.data
  } catch (error: any) {
    console.error("Error archiving verification plan:", error);
    throw new Error(error.response?.data?.message || "Failed to archive subscription plan");
  }
};
