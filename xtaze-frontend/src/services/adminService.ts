import { useDispatch } from "react-redux";
import { saveAdminData } from "../redux/adminSlice";
import { adminApi, artistApi, deezerApi, providerApi, userApi } from "../api/axios";
import { IBanner } from "../pages/User/types/IBanner";

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
    const response = method === "get" || method === "delete"
      ? await instance[method](url, config)
      : await instance[method](url, data, config);
    if (!response.data) throw new Error(`Failed to ${method} ${url}`);
    return response.data as T;
  } catch (error: any) {
    console.error(`Error in ${method} ${url}:`, error);
    throw error;
  }
};

// Define Artist interface
export interface Artist {
  id: string;
  name: string;
  role: string;
  image: string;
  isActive: boolean;
}

// Define Genre interface
export interface Genre {
  _id: string;
  name: string;
  isBlocked: boolean;
}

// Define Banner interface (aligned with backend schema)


// Login with email and password for admin
export const loginAdmin = async (
  email: string,
  password: string,
  dispatch: ReturnType<typeof useDispatch>
): Promise<void> => {
  const data = await apiCall<{ success: boolean; token: string; admin: any; message?: string }>(
    adminApi,
    "post",
    "/login",
    { email, password }
  );
  console.log("Admin login response:", data);
  if (!data.success) throw new Error(data.message || "Admin login failed");
  localStorage.setItem("adminToken", data.token);
  dispatch(saveAdminData(data.admin));
};

// Fetch all artists
export const fetchArtists = async (token: string): Promise<Artist[]> => {
  console.log("Fetching artists with token:", token);
  try {
    const data = await apiCall<{ success: boolean; data: any[]; message?: string }>(
      adminApi,
      "get",
      "/listUsers",
      undefined,
      token
    );
    console.log("Fetch artists response:", data);
    if (!data.success) throw new Error(data.message || "Failed to fetch artists");
    return data.data.map((artist: any) => ({
      id: artist._id,
      name: artist.username,
      role: artist.role,
      image: artist.profilePic || "default-profile-image",
      isActive: artist.isActive ? true : false,
    }));
  } catch (error) {
    console.error("Fetch artists error:", error);
    throw error;
  }
};

// Toggle block/unblock artist
export const toggleBlockArtist = async (
  id: string,
  currentStatus: boolean,
  token: string
): Promise<boolean> => {
  const newStatus = !currentStatus;
  const data = await apiCall<{ success: boolean; message?: string }>(
    adminApi,
    "patch",
    `/toggleBlock/${id}`,
    { status: newStatus },
    token
  );
  console.log("Toggle block response:", data);
  if (!data.success) throw new Error(data.message || "Failed to toggle artist status");
  return newStatus;
};

// Fetch all genres
export const fetchGenres = async (token: string): Promise<Genre[]> => {
  const data = await apiCall<{ data: Genre[] }>(adminApi, "get", "/genreList", undefined, token);
  return data.data;
};

// Add a new genre
export const addGenre = async (name: string, token: string): Promise<Genre> => {
  const data = await apiCall<{ data: Genre; message: string }>(
    adminApi,
    "post",
    "/genreCreate",
    { name },
    token
  );
  return data.data;
};

// Toggle block/unblock genre
export const toggleBlockGenre = async (id: string, token: string): Promise<void> => {
  await apiCall<{ success: boolean }>(adminApi, "put", `/genreToggleBlockUnblock/${id}`, {}, token);
};

// Update a genre
export const updateGenre = async (id: string, name: string, token: string): Promise<{ success: boolean; message: string }> => {
  const data = await apiCall<{ data: { success: boolean; message: string } }>(
    adminApi,
    "put",
    `/genreUpdate/${id}`,
    { name },
    token
  );
  return data.data;
};

// Banner CRUD Operations

// Fetch all banners
export const fetchBanners = async (token: string): Promise<IBanner[]> => {
  const data = await apiCall<{ data: IBanner[] }>(adminApi, "get", "/banners/all", undefined, token);
  return data.data;
};

export const createBanner = async (
  banner: { title: string; description: string; file?: File; action: string; isActive: boolean; createdBy: string },
  token: string
): Promise<IBanner> => {
  const formData = new FormData();
  formData.append("title", banner.title);
  formData.append("description", banner.description);
  if (banner.file) formData.append("image", banner.file);
  formData.append("action", banner.action);
  formData.append("isActive", String(banner.isActive));
  formData.append("createdBy", banner.createdBy);
console.log(formData,"visvajith")
  const data = await apiCall<{ data: IBanner }>(adminApi, "post", "/banners", formData, token);
  return data.data;
};

export const updateBanner = async (
  id: string,
  banner: { title: string; description: string; file?: File; action: string; isActive: boolean },
  token: string
): Promise<IBanner> => {
  const formData = new FormData();
  formData.append("title", banner.title);
  formData.append("description", banner.description);
  if (banner.file) formData.append("image", banner.file);
  formData.append("action", banner.action);
  formData.append("isActive", String(banner.isActive));

  console.log(formData,"odi avaindah comming ",banner.title,banner.description,banner.isActive)
  const data = await apiCall<{ data: IBanner }>(adminApi, "put", `/banners/${id}`, formData, token);
  return data.data;
};

export const deleteBanner = async (id: string, token: string): Promise<void> => {
  await apiCall<{ success: boolean }>(adminApi, "delete", `/banners/${id}`, undefined, token);

};