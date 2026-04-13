import { useDispatch } from "react-redux";
import { artistApi, userApi } from "../api/axios";
import { saveArtistData } from "../redux/artistSlice";
import { IGenre } from "../pages/User/types/IGenre";
import { VerificationStatus } from "../pages/User/types/IverficationStatus";
import { ArtistS } from "../pages/User/types/IArtist";
import { HTTP_METHODS } from "../constants/httpMethods";
import { IAlbum } from "../pages/User/types/IAlbums";
import { clearArtistAuthUtil } from "../utils/clearArtistAuth";

const addRefreshInterceptor = (apiInstance: any) => {
  apiInstance.interceptors.request.use(
    (config: any) => {
      const token = localStorage.getItem("artistToken");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: any) => Promise.reject(error)
  );

  // Response Interceptor
  apiInstance.interceptors.response.use(
    (response: { data: any; status: number; headers: any }) => {
      const newToken = response.data?.token || response.headers["authorization"]?.replace("Bearer ", "");
      if (newToken) {
        localStorage.setItem("artistToken", newToken);
      }
      return response;
    },
async (error: any) => {
      const originalRequest = error.config;
      //if user is banned or refresh token expired logout cheyam
      if (
        error.response?.status === 403 || 
        error.response?.status === 401 && originalRequest._retry 

      ) {
        console.warn("force logout");
        clearArtistAuthUtil(); 
        return Promise.reject(error);
      }

      //Handle expired access token
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const response = await artistApi.post("/refresh", {}, { withCredentials: true });
          const newToken = response.data.token;
          if (!newToken) {
            console.error("No new token → logout");
            clearArtistAuthUtil();
            return Promise.reject(error);
          }

          localStorage.setItem("token", newToken);
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          return apiInstance(originalRequest);
        } catch (refreshErr) {
          console.error("Refresh token failed → logout");
          clearArtistAuthUtil();
          return Promise.reject(refreshErr);
        }
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
    const response = await artistApi.post("/refresh", {}, { withCredentials: true });
    const newToken = response.data.token;
    if (newToken) {
      localStorage.setItem("artistToken", newToken);
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
  data?: any
): Promise<T> => {
  try {
    const response = await instance[method](url, data, { withCredentials: true });
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
  dispatch(saveArtistData(data.artist));
};

// artistService.ts
type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export const fetchArtistTracks = async (
  artistId: string,
  page = 1,
  limit = 10
): Promise<PaginatedResponse<any>> => {
  const data = await apiCall<{
    success: boolean;
    tracks: {
      data: any[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    };
    message?: string;
  }>(
    artistApi,
    HTTP_METHODS.GET,
    `/getAllTracksArtist?userId=${artistId}&page=${page}&limit=${limit}`
  );
  return data.tracks; 
};


export const fetchActiveGenres = async (artistId: string): Promise<{ artist: any; genres: IGenre[] }> => {
  const data = await apiCall<{ success: boolean; data: IGenre[]; artist: any; message?: string }>(
    artistApi,
    HTTP_METHODS.GET,
    `/listActiveGenres?artistId=${artistId}`,
    undefined,

  );
  return { genres: data.data, artist: data.artist };
  if (!data.success) throw new Error(data.message || "Failed to fetch genres");
};

export const uploadSong = async (
  songData: {
    songName: string;
    artist: string;
    genre: string;
    albumId: string;
    image: File | null;
    song: File | null;
  },
): Promise<any> => {
  const formData = new FormData();
  formData.append("songName", songData.songName);
  formData.append("artist", songData.artist);
  formData.append("genre", songData.genre);
  formData.append("albumId", songData.albumId);
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

export const createAlbum = async (albumData: {
  name: string;
  description?: string;
  coverImage?: File | null;
  artistId: string;
}): Promise<IAlbum> => {
  const formData = new FormData();
  formData.append("name", albumData.name);
  if (albumData.description) formData.append("description", albumData.description);
  if (albumData.coverImage) formData.append("coverImage", albumData.coverImage);
  formData.append("artistId", albumData.artistId);
  const data = await apiCall<{ success: boolean; data: IAlbum }>(artistApi, HTTP_METHODS.POST, "/albumsa", formData);
  // if (!data.success) throw new Error(data.message || "Failed to create album");
  return data.data;
};

export const fetchAlbums = async (artistId: string): Promise<IAlbum[]> => {
  const data = await apiCall<{ success: boolean; data: IAlbum[] }>(artistApi, HTTP_METHODS.GET, `/albums?artistId=${artistId}`);
  // if (!data.success) throw new Error(data.message || "Failed to fetch albums");
  return data.data;
};

export const fetchAlbumSongs = async (albumId: string): Promise<IAlbum> => {
  const data = await apiCall<{ success: boolean; data: IAlbum }>(
    artistApi,
    HTTP_METHODS.GET,
    `/albumsongs?albumId=${albumId}`
  );
  return data.data;
};
export const updateTrackByArtist = async (trackId: string, songData: {
  title: string;
  artists: string[];
  genre: string[];
  albumId?: string;
  img?: File;
  fileUrl?: File;
}): Promise<any> => {
  const formData = new FormData();
  formData.append("title", songData.title);
  formData.append("artists", songData.artists.join(", "));
  formData.append("genre", songData.genre.join(", "));
  if (songData.albumId) formData.append("album", songData.albumId);
  if (songData.img) formData.append("img", songData.img);
  if (songData.fileUrl) formData.append("fileUrl", songData.fileUrl);
  console.log(songData,"insane")
  const data = await apiCall<{ success: boolean; track: unknown }>(
    artistApi,
    HTTP_METHODS.PUT,
    `/updateTrackByArtist?TrackId=${trackId}`,
    formData
  );
  return data.track;
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
  const data = await apiCall<{ data: { stripePaymentMethodId: string } }>(
    artistApi,
    HTTP_METHODS.GET,
    `/checkcard?userId=${artistId}`,
    undefined,
    
  );
  return !!data.data.stripePaymentMethodId; 
};

export const saveCard = async (artistId: string, paymentMethodId: string): Promise<void> => {
  const data = await apiCall<{ success: boolean; message?: string }>(
    artistApi,
    HTTP_METHODS.POST,
    "/saveCard",
    { artistId, paymentMethodId },
    
  );
  if (!data.success) throw new Error(data.message || "Failed to save card");
};





export const getVerificationStatus = async (artistId: string): Promise<VerificationStatus> => {
  try {

    const response = await apiCall<{ success: boolean; data: VerificationStatus }>(
      artistApi,
      HTTP_METHODS.GET,
      `/getVerificationStatus?artistId=${artistId}`,

    );
    return response.data;
  } catch (error: any) {
    console.error("Error fetching verification status:", error);
    return { status: "unsubmitted" };
  }
};

export const requestVerification = async (artistId: string,formData: FormData): Promise<{ idProof: string }> => {
  formData.append("artistId", artistId);
  console.log(formData,"insn")
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



type SongStat = {
  trackId: string;
  trackName: string;
  totalPlays: number;
  monthlyPlays: number;
};

export const fetchSongEarnings = async (
  artistId: string,
  page: number,
  limit: number
): Promise<{ data: (SongStat & { totalEarnings: number; monthlyEarnings: number })[]; totalPages: number }> => {
  const res = await apiCall<PaginatedResponse<SongStat>>(
    artistApi,
    HTTP_METHODS.GET,
    `/statsOfArtist?userId=${artistId}&page=${page}&limit=${limit}`,
    undefined
  );
  const mappedData = res.data.map((song) => ({
    ...song,
    totalEarnings: song.totalPlays * 0.5,
    monthlyEarnings: song.monthlyPlays * 0.5,
  }));

  return {
    data: mappedData,
    totalPages: res.pagination.totalPages,
  };
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
    return response.data;
  } catch (error: any) {
    console.error("Error updating username:", error);
    throw new Error(error.response?.data?.message || "Failed to update username");
  }
};




























