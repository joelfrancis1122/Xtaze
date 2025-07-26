import { useDispatch } from "react-redux";
import { saveAdminData } from "../redux/adminSlice";
import { adminApi, artistApi } from "../api/axios";
import { IBanner } from "../pages/User/types/IBanner";
import { Artist } from "../pages/User/types/IArtist";
import { IGenre } from "../pages/User/types/IGenre";
import { Track } from "../pages/User/types/ITrack";
import { Coupon } from "../pages/User/types/ICoupon";
import {  SubscriptionPlan } from "../pages/User/types/IStripe";
import { MusicMonetization } from "../pages/User/types/IMonetization";
import { ListenerUser } from "../pages/User/types/IListenerUser";
import { HTTP_METHODS } from "../constants/httpMethods";

const apiCall = async <T>(
  instance: any,
  method: typeof HTTP_METHODS[keyof typeof HTTP_METHODS],
  url: string,
  data?: any,
): Promise<T> => {
  try {
    const token = localStorage.getItem("adminToken");
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


export const loginAdmin = async (email: string,password: string,dispatch: ReturnType<typeof useDispatch>): Promise<void> => {
  const data = await apiCall<{ success: boolean; token: string; admin: any; message?: string }>(
    adminApi,
    HTTP_METHODS.POST,
    "/login",
    { email, password }
  );
  if (!data.success) throw new Error(data.message || "Admin login failed");
  localStorage.setItem("adminToken", data.token);
  dispatch(saveAdminData(data.admin));
};

export const fetchArtists = async (): Promise<Artist[]> => {
  try {
    const data = await apiCall<{ success: boolean; data: any[]; message?: string }>(
      adminApi,
      HTTP_METHODS.GET,
      "/listUsers",
      undefined,
    );
    if (!data.success) throw new Error(data.message || "Failed to fetch artists");
    return data.data.map((artist: any) => ({
      id: artist._id,
      name: artist.username,
      role: artist.role,
      image: artist.profilePic ,
      isActive: artist.isActive ? true : false,
    }));
  } catch (error) {
    console.error("Fetch artists error:", error);
    throw error;
  }
};


export const fetchArtistTracks = async (userId: string,): Promise<Track[]> => {
  try {
    const data = await apiCall<{ success: boolean; tracks?: Track[]; message?: string }>(
      artistApi,
      HTTP_METHODS.GET,
      `/getAllTracksArtist?userId=${userId}`,
      undefined,
      // token
    );
    if (!data.success || !Array.isArray(data.tracks)) {
      throw new Error(data.message || "Failed to fetch artist tracks");
    }
    return data.tracks;
  } catch (error) {
    console.error("Error fetching artist tracks:", error);
    throw error;
  }
};

export const toggleBlockArtist = async (id: string,currentStatus: boolean,): Promise<boolean> => {
  const newStatus = !currentStatus;
  const data = await apiCall<{ success: boolean; message?: string }>(
    adminApi,
    HTTP_METHODS.PATCH,
    `/toggleBlock/${id}`,
    { status: newStatus },
    
  );
  if (!data.success) throw new Error(data.message || "Failed to toggle artist status");
  return newStatus;
};

export const fetchGenres = async (): Promise<IGenre[]> => {
  const data = await apiCall<{ data: IGenre[] }>(adminApi, HTTP_METHODS.GET, "/genreList", undefined);
  return data.data;
};



export const addGenre = async (name: string,): Promise<IGenre> => {
  const data = await apiCall<{ data: IGenre; message: string }>(
    adminApi,
    HTTP_METHODS.POST,
    "/genreCreate",
    { name },
    
  );
  return data.data;
};

export const toggleBlockGenre = async (id: string): Promise<void> => {
  await apiCall<{ success: boolean }>(adminApi, HTTP_METHODS.PUT, `/genreToggleBlockUnblock/${id}`, {});
};

export const updateGenre = async (id: string, name: string): Promise<{ success: boolean; message: string }> => {
  const data = await apiCall<{ data: { success: boolean; message: string } }>(
    adminApi,
    HTTP_METHODS.PUT,
    `/genreUpdate/${id}`,
    { name },
    
  );
  return data.data;
};

export const fetchBanners = async (): Promise<IBanner[]> => {
  const data = await apiCall<{ data: IBanner[] }>(adminApi, HTTP_METHODS.GET, "/banners/all", undefined);
  return data.data;
};

export const createBanner = async (
  banner: { title: string; description: string; file?: File; action: string; isActive: boolean; createdBy: string },
  
): Promise<IBanner> => {
  const formData = new FormData();
  formData.append("title", banner.title);
  formData.append("description", banner.description);
  if (banner.file) formData.append("image", banner.file);
  formData.append("action", banner.action);
  formData.append("isActive", String(banner.isActive));
  formData.append("createdBy", banner.createdBy);
  const data = await apiCall<{ data: IBanner }>(adminApi, HTTP_METHODS.POST, "/banners", formData);
  return data.data;
};

export const updateBanner = async (
  id: string,
  banner: { title: string; description: string; file?: File; action: string; isActive: boolean },
  
): Promise<IBanner> => {
  const formData = new FormData();
  formData.append("title", banner.title);
  formData.append("description", banner.description);
  if (banner.file) formData.append("image", banner.file);
  formData.append("action", banner.action);
  formData.append("isActive", String(banner.isActive));

  const data = await apiCall<{ data: IBanner }>(adminApi, HTTP_METHODS.PUT, `/banners/${id}`, formData);
  return data.data;
};

export const deleteBanner = async (id: string): Promise<void> => {
  await apiCall<{ success: boolean }>(adminApi, HTTP_METHODS.DELETE, `/banners/${id}`, undefined);

};

export const fetchUserDetails = async (userIds: string[]): Promise<ListenerUser[]> => {
  try {
    const data = await apiCall<{ success: boolean; data: ListenerUser[]; message?: string }>(
      adminApi,
      HTTP_METHODS.POST,
      "/getUsersByIds",
      { userIds },
      
    );

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
      HTTP_METHODS.GET,
      "/coupons",
    );

    return data.data;
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw error;
  }
};


export const fetchSubscriptionHistory = async (): Promise<any> => {
  try {
    const data = await apiCall<{ data: any }>(
      adminApi,
      HTTP_METHODS.GET,
      "/stripe/subscription-history",
      undefined,
      
    );
    return data.data;
  } catch (error: any) {
    console.error("Error fetching subscription history:", error);
    throw new Error(error.message || "Failed to fetch subscription history");
  }
};



export const createCoupon = async (couponData: { code: string; discountAmount: number; expires: string; maxUses: number }): Promise<Coupon> => {
  try {
    const data = await apiCall<{ result: Coupon }>(
      adminApi,
      HTTP_METHODS.POST,
      "/coupons",
      { ...couponData, uses: 0 },
    );
    return data.result;
  } catch (error: any) {
    console.error("Error creating coupon:", error);
    throw new Error(error.response?.data?.message || "Failed to create coupon");
  }
};

export const updateCoupon = async (id: string, couponData: { code: string; discountAmount: number; expires: string; maxUses: number }): Promise<Coupon> => {
  try {
    const data = await apiCall<{ data: Coupon }>(
      adminApi,
      HTTP_METHODS.PUT,
      `/coupons?id=${id}`,
      couponData,
      
    );
    return data.data;
  } catch (error: any) {
    console.error("Error updating coupon:", error);
    throw new Error(error.response?.data?.message || "Failed to update coupon");
  }
};

export const deleteCoupon = async (id: string): Promise<void> => {
  try {
    await apiCall<{ success: boolean }>(
      adminApi,
      HTTP_METHODS.DELETE,
      `/coupons?id=${id}`,
      undefined,
      
    );
  } catch (error: any) {
    console.error("Error deleting coupon:", error);
    throw new Error(error.response?.data?.message || "Failed to delete coupon");
  }
};

export const fetchMonetizationData = async (): Promise<MusicMonetization[]> => {
  try {
    const data = await apiCall<{ data: MusicMonetization[] }>(
      adminApi,
      HTTP_METHODS.GET,
      "/music/monetization",
      undefined,
      
    );
    return data.data || [];
  } catch (error: any) {
    console.error("Error fetching monetization data:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch monetization data");
  }
};

export const initiateArtistPayout = async (artistName: string, ): Promise<string> => {
  try {
    const data = await apiCall<{ data: { sessionUrl: string } }>(
      adminApi,
      HTTP_METHODS.POST,
      "/artistPayout",
      { artistName },
      
    );
    return data.data.sessionUrl;
  } catch (error: any) {
    console.error("Error initiating payout:", error);
    throw new Error(error.response?.data?.message || "Failed to initiate payout");
  }
};



export const fetchSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  try {
    const data = await apiCall<{ data: SubscriptionPlan[] }>(
      adminApi,
      HTTP_METHODS.GET,
      "/stripe/plans",
      undefined,
    );
    return data.data || [];
  } catch (error: any) {
    console.error("Error fetching subscription plans:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch subscription plans");
  }
};

export const createSubscriptionPlan = async (
  planData: { name: string; description?: string; price: number; interval: "month" | "year" },
): Promise<SubscriptionPlan> => {
  try {
    const unitAmount = Math.round(parseFloat(planData.price.toString()) * 100); // Convert dollars to cents
    const data = await apiCall<{ data: SubscriptionPlan }>(
      adminApi,
      HTTP_METHODS.POST,
      "/stripe/createProduct",
      {
        name: planData.name,
        description: planData.description,
        price: unitAmount,
        interval: planData.interval,
      },
    );
    return data.data;
  } catch (error: any) {
    console.error("Error creating subscription plan:", error);
    throw new Error(error.response?.data?.message || "Failed to create subscription plan");
  }
};

export const updateSubscriptionPlan = async (
  productId: string,
  planData: { name: string; description?: string; price: number; interval: "month" | "year" },
): Promise<SubscriptionPlan> => {
  try {
    const unitAmount = Math.round(parseFloat(planData.price.toString()) * 100); // Convert dollars to cents
    const data = await apiCall<{ data: SubscriptionPlan }>(
      adminApi,
      HTTP_METHODS.PUT,
      `/stripe/products/?productId=${productId}`,
      {
        name: planData.name,
        description: planData.description,
        price: unitAmount,
        interval: planData.interval,
      },
    );
    return data.data;
  } catch (error: any) {
    console.error("Error updating subscription plan:", error);
    throw new Error(error.response?.data?.message || "Failed to update subscription plan");
  }
};

export const archiveSubscriptionPlan = async (productId: string,): Promise<void> => {
  try {
    await apiCall<{ status: number }>(
      adminApi,
      HTTP_METHODS.POST,
      `/stripe/products/delete?productId=${productId}`,
      undefined,
    );
  } catch (error: any) {
    console.error("Error archiving subscription plan:", error);
    throw new Error(error.response?.data?.message || "Failed to archive subscription plan");
  }
};
export const fetchAllArtistsVerification = async (): Promise<any> => {
  try {
    const response = await apiCall<{ data: any }>(
      adminApi,
      HTTP_METHODS.GET,
      `/fetchAllArtistsVerification`,
      undefined,
    );
    return response.data
  } catch (error: any) {
    console.error("Error archiving verification plan:", error);
    throw new Error(error.response?.data?.message || "Failed to archive subscription plan");
  }
};



export const updateVerificationStatus = async (
  status: "approved" | "rejected" | "pending" | "unsubmitted",
  feedback: string | null,
  id: string,
): Promise<any> => {
  try {
    const response = await apiCall(
      adminApi,
      HTTP_METHODS.PUT,
      `/updateVerificationStatus?id=${id}`,
      { status, feedback },
      
    );
    return response;
  } catch (error) {
    console.error("Error in updateVerificationStatus service:", error);
    throw error;
  }
};