import { useDispatch } from "react-redux";
import { saveAdminData } from "../redux/adminSlice";
import { adminApi, artistApi } from "../api/axios";
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

export interface Song {
  playHistory: any;
  _id: string;
  title: string;
  fileUrl: string;
  listeners: string[];
  duration?: string;
}
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


export const fetchArtistTracks = async (userId: string, token: string): Promise<Song[]> => {
  try {
    const data = await apiCall<{ success: boolean; tracks?: Song[]; message?: string }>(
      artistApi,
      "get",
      `/getAllTracksArtist?userId=${userId}`,
      undefined,
      token
    );
    console.log("Fetch artist tracks response:", data);
    if (!data.success || !Array.isArray(data.tracks)) {
      throw new Error(data.message || "Failed to fetch artist tracks");
    }
    return data.tracks;
  } catch (error) {
    console.error("Error fetching artist tracks:", error);
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

export interface ListenerUser {
  _id: string;
  gender: string; 
  year:number
  age: number; 
  country: string; 
}

export const fetchUserDetails = async (userIds: string[], token: string): Promise<ListenerUser[]> => {
  try {
    const data = await apiCall<{ success: boolean; data: ListenerUser[]; message?: string }>(
      adminApi,
      "post",
      "/getUsersByIds",
      { userIds },
      token
    );
    console.log("Fetch user details response:", data);
 
    return data.data;
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw error;
  }
};
export const fetchCoupons = async (): Promise<any> => {
  try {
    const data = await apiCall<{ success: boolean; data: string[]; message?: string }>(
      adminApi,
      "get",
      "/coupons",
    );
    console.log("Fetch user details response:", data);
 
    return data.data;
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw error;
  }
};


export const fetchSubscriptionHistory = async (token?: string): Promise<any> => {
  console.log("Fetching subscription history...");
  try {
    const data = await apiCall<{ data: any}>(
      adminApi,
      "get",
      "/stripe/subscription-history",
      undefined,
      token
    );
    console.log("Fetched subscription history:", data.data);
    return data.data;
  } catch (error: any) {
    console.error("Error fetching subscription history:", error);
    throw new Error(error.message || "Failed to fetch subscription history");
  }
};

// export const fetchCoupons = async (token?: string): Promise<Coupon[]> => {
//   console.log("Fetching coupons...");
//   try {
//     const data = await apiCall<{ data: Coupon[] }>(
//       adminApi,
//       "get",
//       "/coupons",
//       undefined,
//       token
//     );
//     console.log("Fetched coupons:", data.data);
//     return data.data || [];
//   } catch (error: any) {
//     console.error("Error fetching coupons:", error);
//     throw new Error(error.response?.data?.message || "Failed to fetch coupons");
//   }
// };

// New function to create a coupon
export const createCoupon = async (couponData: { code: string; discountAmount: number; expires: string; maxUses: number }, token?: string): Promise<Coupon> => {
  console.log("Creating coupon with:", couponData);
  try {
    const data = await apiCall<{ result: Coupon }>(
      adminApi,
      "post",
      "/coupons",
      { ...couponData, uses: 0 },
      token
    );
    console.log("Created coupon:", data.result);
    return data.result;
  } catch (error: any) {
    console.error("Error creating coupon:", error);
    throw new Error(error.response?.data?.message || "Failed to create coupon");
  }
};

// New function to update a coupon
export const updateCoupon = async (id: string, couponData: { code: string; discountAmount: number; expires: string; maxUses: number }, token?: string): Promise<Coupon> => {
  console.log("Updating coupon with:", { id, couponData });
  try {
    const data = await apiCall<{ data: Coupon }>(
      adminApi,
      "put",
      `/coupons?id=${id}`,
      couponData,
      token
    );
    console.log("Updated coupon:", data.data);
    return data.data;
  } catch (error: any) {
    console.error("Error updating coupon:", error);
    throw new Error(error.response?.data?.message || "Failed to update coupon");
  }
};

// New function to delete a coupon
export const deleteCoupon = async (id: string, token?: string): Promise<void> => {
  console.log("Deleting coupon with id:", id);
  try {
    await apiCall<{ success: boolean }>(
      adminApi,
      "delete",
      `/coupons?id=${id}`,
      undefined,
      token
    );
    console.log("Coupon deleted successfully");
  } catch (error: any) {
    console.error("Error deleting coupon:", error);
    throw new Error(error.response?.data?.message || "Failed to delete coupon");
  }
};
export interface Coupon {
  _id: string;
  code: string;
  discountAmount: number;
  expires: string;
  maxUses: number;
  uses: number;
  status: string;
}