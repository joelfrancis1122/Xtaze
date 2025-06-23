import { useDispatch } from "react-redux";
import { artistApi, userApi } from "../api/axios";
import { saveArtistData } from "../redux/artistSlice";
import { IGenre } from "../pages/User/types/IGenre";
import { VerificationStatus } from "../pages/User/types/IverficationStatus";
import { ArtistS } from "../pages/User/types/IArtist";
import { HTTP_METHODS } from "../constants/httpMethods";

const addRefreshInterceptor = (apiInstance: any) => {
  apiInstance.interceptors.response.use(
    (response: { data: any; status: number; headers: any }) => {
      const newToken = response.data?.token || response.headers["authorization"]?.replace("Bearer ", "");
      if (newToken) {
        localStorage.setItem("artistToken", newToken);
        console.log("Updated artist token in localStorage:", newToken);
      }
      return response;
    },
    async (error: any) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        console.log("Calling artist refresh token due to 401");

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
  method: typeof HTTP_METHODS[keyof typeof HTTP_METHODS],
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

export const loginArtist = async (email: string,password: string,dispatch: ReturnType<typeof useDispatch>): Promise<void> => {
  const data = await apiCall<{ success: boolean; artist: any; message?: string }>(
    artistApi,
    HTTP_METHODS.POST,
    "/login",
    { email, password }
  );
  if (!data.success) throw new Error(data.message || "Failed to login artist");
  console.log("Login response:", data);
  dispatch(saveArtistData(data.artist));
};

export const fetchArtistTracks = async (artistId: string): Promise<any[]> => {
  console.log("Fetching artist tracks with:", { artistId });
  const data = await apiCall<{ success: boolean; tracks: any[]; message?: string }>(
    artistApi,
    HTTP_METHODS.GET,
    `/getAllTracksArtist?userId=${artistId}`,
    undefined,
  
  );
  if (!data.success) throw new Error(data.message || "Failed to fetch artist tracks");
  return data.tracks;
};

export const fetchActiveGenres = async (artistId: string): Promise<{ artist: any; genres: IGenre[] }> => {
  console.log("Fetching active genres with:", { artistId});
  const data = await apiCall<{ success: boolean; data: IGenre[]; artist: any; message?: string }>(
    artistApi,
    HTTP_METHODS.GET,
    `/listActiveGenres?artistId=${artistId}`,
    undefined,

  );
  if (!data.success) throw new Error(data.message || "Failed to fetch genres");
  return { genres: data.data, artist: data.artist };
};

export const uploadSong = async (
  songData: {
    songName: string;
    artist: string;
    genre: string;
    album: string;
    image: File | null;
    song: File | null;
  },
): Promise<any> => {
  console.log("Uploading song with:", { songData });
  const formData = new FormData();
  formData.append("songName", songData.songName);
  formData.append("artist", songData.artist);
  formData.append("genre", songData.genre);
  formData.append("album", songData.album);
  if (songData.image) formData.append("image", songData.image);
  if (songData.song) formData.append("file", songData.song);

  const data = await apiCall<{ success: boolean; message?: string }>(
    artistApi,
    HTTP_METHODS.POST,
    "/upload",
    formData,
  );
  if (!data.success) throw new Error(data.message || "Failed to upload song");
  return data;
};


export const uploadProfileImage = async (artistId: string, base64Image: string): Promise<any> => {
  const blob = await (await fetch(base64Image)).blob();
  const formData = new FormData();
  formData.append("profileImage", blob, "artist-profileImage.jpg");
  formData.append("userId", artistId);

  const data = await apiCall<{ success: boolean; user?: any; message?: string }>(
    userApi,
    HTTP_METHODS.POST,
    "/uploadProfilepic",
    formData,
  );
  if (!data.success || !data.user) throw new Error(data.message || "Failed to upload profile picture");
  return data.user;
};

export const updateArtistBanner = async (artistId: string, base64Banner: string): Promise<any> => {
  const blob = await (await fetch(base64Banner)).blob();
  const formData = new FormData();
  formData.append("coverImage", blob, `artist-coverImage.${blob.type.startsWith("video/") ? "mp4" : "jpg"}`);
  formData.append("userId", artistId);

  const data = await apiCall<{ success: boolean; user?: any; message?: string }>(
    userApi,
    HTTP_METHODS.POST,
    "/updateBanner",
    formData,
    
  );
  if (!data.success || !data.user) throw new Error(data.message || "Failed to update banner");
  return data.user;
};

export const updateArtistBio = async (artistId: string, bio: string,): Promise<any> => {
  console.log("Updating artist bio with:", { artistId });
  const data = await apiCall<{ success: boolean; user?: any; message?: string }>(
    userApi,
    HTTP_METHODS.PUT,
    "/updateBio",
    { userId: artistId, bio },
    
  );
  if (!data.success || !data.user) throw new Error(data.message || "Failed to update bio");
  return data.user;
};

export const checkCardStatus = async (artistId: string): Promise<boolean> => {
  console.log("Checking card status with:", { artistId });
  const data = await apiCall<{ data: { stripePaymentMethodId: string } }>(
    artistApi,
    HTTP_METHODS.GET,
    `/checkcard?userId=${artistId}`,
    undefined,
    
  );
  console.log("Card status response:", data);
  return !!data.data.stripePaymentMethodId; 
};

export const saveCard = async (artistId: string, paymentMethodId: string): Promise<void> => {
  console.log("Saving card with:", { artistId, paymentMethodId });
  const data = await apiCall<{ success: boolean; message?: string }>(
    artistApi,
    HTTP_METHODS.POST,
    "/saveCard",
    { artistId, paymentMethodId },
    
  );
  if (!data.success) throw new Error(data.message || "Failed to save card");
};





export const getVerificationStatus = async (artistId: string): Promise<VerificationStatus> => {
  console.log("Fetching verification status for:", { artistId});
  try {
    const response = await apiCall<{ success: boolean; data: VerificationStatus }>(
      artistApi,
      HTTP_METHODS.GET,
      `/getVerificationStatus?artistId=${artistId}`,

    );
    console.log(response, "verification on proces what ?")
    return response.data;
  } catch (error: any) {
    console.error("Error fetching verification status:", error);
    return { status: "unsubmitted" }; // if no record exists
  }
};

export const requestVerification = async (artistId: string,formData: FormData): Promise<{ idProof: string }> => {
  formData.append("artistId", artistId);

  const data = await apiCall<{ success: boolean; idProof?: string; message?: string }>(
    artistApi,
    HTTP_METHODS.POST,
    "/requestVerification",
    formData,

  );

  if (!data.success || !data.idProof) {
    throw new Error(data.message || "Failed to submit verification request");
  }

  return { idProof: data.idProof };
};



export const fetchSongEarnings = async (artistId: string): Promise<any[]> => {
  console.log("Fetching song earnings with:", { artistId });
  const data = await apiCall<{ data: any[] }>(
    artistApi,
    HTTP_METHODS.GET,
    `/statsOfArtist?userId=${artistId}`,
    undefined,
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

export const updateArtistUsername = async (
  id: string, 
  name: string, 

): Promise<ArtistS> => {  //returning Artist
  try {
    const response = await apiCall<{ data: ArtistS }>(
      userApi,
      HTTP_METHODS.PUT,
      `/usersName?id=${id}`,
      { username: name },
      
    );
    console.log("Update username response:", response);
    return response.data;
  } catch (error: any) {
    console.error("Error updating username:", error);
    throw new Error(error.response?.data?.message || "Failed to update username");
  }
};




























