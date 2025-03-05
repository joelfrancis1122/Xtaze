import { useDispatch } from "react-redux";
import { deezerApi, providerApi, userApi } from "../api/axios";
import { artistApi } from "../api/axios";
import { Track } from "../pages/User/Types";
// Fetch all tracks (premium or free)
export const fetchTracks = async (
  userId: string,
  token: string,
  isPremium: boolean
): Promise<{ tracks: Track[]; user?: any }> => { // Updated return type
  try {
    let response;
    if (isPremium) {
      response = await providerApi.get(`/getAllTracks?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      response = await deezerApi.get(`/songs/deezer?userId=${userId}`, { // Fixed path from /api/songs/deezer
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    if (!response.data) throw new Error(`Failed to fetch ${isPremium ? "premium" : "free"} tracks`);

    const data = response.data;
    const formattedTracks: Track[] = (isPremium ? data.tracks : data.songs).map((track: any) => ({
      _id: track._id || track.fileUrl,
      title: track.title,
      album: track.album || "Unknown Album",
      artist: Array.isArray(track.artists)
        ? track.artists
        : track.artists
        ? JSON.parse(track.artists)
        : [track.artist || "Unknown Artist"],
      genre: track.genre ? (Array.isArray(track.genre) ? track.genre : [track.genre]) : ["Unknown Genre"],
      fileUrl: track.fileUrl,
      img: track.img,
      listeners: track.listeners || 0,
    }));

    return {
      tracks: formattedTracks,
      user: data.user || undefined, // Return user if it exists in response.data
    };
  } catch (error) {
    console.error("Error fetching tracks:", error);
    throw error;
  }
};

// Fetch liked songs
export const fetchLikedSongs = async (userId: string, token: string, songIds: string[]): Promise<Track[]> => {
  try {
    const response = await userApi.post(
      `/getliked?userId=${userId}`,
      { songIds },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.data.success) {
      return response.data.tracks.map((song: any) => ({
        _id: song._id,
        title: song.title,
        artist: Array.isArray(song.artists) ? song.artists : [song.artists || "Unknown Artist"],
        fileUrl: song.fileUrl,
        img: song.img,
        album: song.album || "Unknown Album",
        genre: song.genre ? (Array.isArray(song.genre) ? song.genre : [song.genre]) : [],
        listeners: song.listeners || 0,
      }));
    } else {
      throw new Error("Failed to fetch liked songs details");
    }
  } catch (error) {
    console.error("Error fetching liked songs:", error);
    throw error;
  }
};

// Increment listeners
export const incrementListeners = async (trackId: string, token: string): Promise<void> => {
  try {
    const response = await artistApi.post(
      "/incrementListeners",
      { trackId },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.data.success) throw new Error("Failed to increment listeners");
  } catch (error) {
    console.error("Error incrementing listeners:", error);
    throw error;
  }
};

// Toggle like
export const toggleLike = async (userId: string, trackId: string, token: string): Promise<any> => {
  try {
    const response = await userApi.post(
      `/toggle-like?userId=${userId}`,
      { trackId },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.data.success) throw new Error("Failed to toggle like");
    return response.data.user; // Updated user data
  } catch (error) {
    console.error("Error toggling like:", error);
    throw error;
  }
};


export const uploadProfileImage = async (userId: string, base64Image: string,  token: string ): Promise<any> => {
  try {
    const blob = await (await fetch(base64Image)).blob();
    const formData = new FormData();
    formData.append("profileImage", blob, "cropped-image.jpg");
    formData.append("userId", userId);

    const response = await userApi.post<{ success: boolean; user?: any }>(
      "/uploadProfilepic",
      formData,
      {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`, // Include the token
        },
      }
    );

    if (response.data.success && response.data.user) {
      return response.data.user; // Return updated user data
    } else {
      throw new Error("Failed to upload profile picture");
    }
  } catch (error) {
    console.error("Error uploading profile image:", error);
    throw error;
  }
};
