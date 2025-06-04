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
import { COUPON_ROUTE } from "../constants/routeConstants";


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


export const loginAdmin = async (email: string,password: string,dispatch: ReturnType<typeof useDispatch>): Promise<void> => {
  const data = await apiCall<{ success: boolean; token: string; admin: any; message?: string }>(
    adminApi,
    HTTP_METHODS.POST,
    "/login",
    { email, password }
  );
  console.log("Admin login response:", data);
  if (!data.success) throw new Error(data.message || "Admin login failed");
  localStorage.setItem("adminToken", data.token);
  dispatch(saveAdminData(data.admin));
};

export const fetchArtists = async (token: string): Promise<Artist[]> => {
  console.log("Fetching artists with token:", token);
  try {
    const data = await apiCall<{ success: boolean; data: any[]; message?: string }>(
      adminApi,
      HTTP_METHODS.GET,
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
      image: artist.profilePic ,
      isActive: artist.isActive ? true : false,
    }));
  } catch (error) {
    console.error("Fetch artists error:", error);
    throw error;
  }
};


export const fetchArtistTracks = async (userId: string, token: string): Promise<Track[]> => {
  try {
    const data = await apiCall<{ success: boolean; tracks?: Track[]; message?: string }>(
      artistApi,
      HTTP_METHODS.GET,
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

export const toggleBlockArtist = async (id: string,currentStatus: boolean,token: string): Promise<boolean> => {
  const newStatus = !currentStatus;
  const data = await apiCall<{ success: boolean; message?: string }>(
    adminApi,
    HTTP_METHODS.PATCH,
    `/toggleBlock/${id}`,
    { status: newStatus },
    token
  );
  console.log("Toggle block response:", data);
  if (!data.success) throw new Error(data.message || "Failed to toggle artist status");
  return newStatus;
};

export const fetchGenres = async (token: string): Promise<IGenre[]> => {
  const data = await apiCall<{ data: IGenre[] }>(adminApi, HTTP_METHODS.GET, "/genreList", undefined, token);
  return data.data;
};



export const addGenre = async (name: string, token: string): Promise<IGenre> => {
  const data = await apiCall<{ data: IGenre; message: string }>(
    adminApi,
    HTTP_METHODS.POST,
    "/genreCreate",
    { name },
    token
  );
  return data.data;
};

export const toggleBlockGenre = async (id: string, token: string): Promise<void> => {
  await apiCall<{ success: boolean }>(adminApi, HTTP_METHODS.PUT, `/genreToggleBlockUnblock/${id}`, {}, token);
};

export const updateGenre = async (id: string, name: string, token: string): Promise<{ success: boolean; message: string }> => {
  const data = await apiCall<{ data: { success: boolean; message: string } }>(
    adminApi,
    HTTP_METHODS.PUT,
    `/genreUpdate/${id}`,
    { name },
    token
  );
  return data.data;
};

export const fetchBanners = async (token: string): Promise<IBanner[]> => {
  const data = await apiCall<{ data: IBanner[] }>(adminApi, HTTP_METHODS.GET, "/banners/all", undefined, token);
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
  console.log(formData, "visvajith")
  const data = await apiCall<{ data: IBanner }>(adminApi, HTTP_METHODS.POST, "/banners", formData, token);
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

  console.log(formData, "odi avaindah comming ", banner.title, banner.description, banner.isActive)
  const data = await apiCall<{ data: IBanner }>(adminApi, HTTP_METHODS.PUT, `/banners/${id}`, formData, token);
  return data.data;
};

export const deleteBanner = async (id: string, token: string): Promise<void> => {
  await apiCall<{ success: boolean }>(adminApi, HTTP_METHODS.DELETE, `/banners/${id}`, undefined, token);

};

export const fetchUserDetails = async (userIds: string[], token: string): Promise<ListenerUser[]> => {
  try {
    const data = await apiCall<{ success: boolean; data: ListenerUser[]; message?: string }>(
      adminApi,
      HTTP_METHODS.POST,
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
      HTTP_METHODS.GET,
      COUPON_ROUTE,
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
    const data = await apiCall<{ data: any }>(
      adminApi,
      HTTP_METHODS.GET,
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



export const createCoupon = async (couponData: { code: string; discountAmount: number; expires: string; maxUses: number }, token?: string): Promise<Coupon> => {
  console.log("Creating coupon with:", couponData);
  try {
    const data = await apiCall<{ result: Coupon }>(
      adminApi,
      HTTP_METHODS.POST,
      COUPON_ROUTE,
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

export const updateCoupon = async (id: string, couponData: { code: string; discountAmount: number; expires: string; maxUses: number }, token?: string): Promise<Coupon> => {
  console.log("Updating coupon with:", { id, couponData });
  try {
    const data = await apiCall<{ data: Coupon }>(
      adminApi,
      HTTP_METHODS.PUT,
      `${COUPON_ROUTE}?id=${id}`,
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

export const deleteCoupon = async (id: string, token?: string): Promise<void> => {
  console.log("Deleting coupon with id:", id);
  try {
    await apiCall<{ success: boolean }>(
      adminApi,
      HTTP_METHODS.DELETE,
      `${COUPON_ROUTE}?id=${id}`,
      undefined,
      token
    );
    console.log("Coupon deleted successfully");
  } catch (error: any) {
    console.error("Error deleting coupon:", error);
    throw new Error(error.response?.data?.message || "Failed to delete coupon");
  }
};

export const fetchMonetizationData = async (token?: string): Promise<MusicMonetization[]> => {
  console.log("Fetching monetization data...");
  try {
    const data = await apiCall<{ data: MusicMonetization[] }>(
      adminApi,
      HTTP_METHODS.GET,
      "/music/monetization",
      undefined,
      token
    );
    console.log("Fetched monetization data:", data.data);
    return data.data || [];
  } catch (error: any) {
    console.error("Error fetching monetization data:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch monetization data");
  }
};

export const initiateArtistPayout = async (artistName: string, token?: string): Promise<string> => {
  console.log("Initiating payout for artist:", artistName);
  try {
    const data = await apiCall<{ data: { sessionUrl: string } }>(
      adminApi,
      HTTP_METHODS.POST,
      "/artistPayout",
      { artistName },
      token
    );
    console.log("Payout session URL:", data.data.sessionUrl);
    return data.data.sessionUrl;
  } catch (error: any) {
    console.error("Error initiating payout:", error);
    throw new Error(error.response?.data?.message || "Failed to initiate payout");
  }
};



export const fetchSubscriptionPlans = async (token?: string): Promise<SubscriptionPlan[]> => {
  console.log("Fetching subscription plans...");
  try {
    const data = await apiCall<{ data: SubscriptionPlan[] }>(
      adminApi,
      HTTP_METHODS.GET,
      "/stripe/plans",
      undefined,
      token
    );
    console.log("Fetched subscription plans:", data.data);
    return data.data || [];
  } catch (error: any) {
    console.error("Error fetching subscription plans:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch subscription plans");
  }
};

export const createSubscriptionPlan = async (
  planData: { name: string; description?: string; price: number; interval: "month" | "year" },
  token?: string
): Promise<SubscriptionPlan> => {
  console.log("Creating subscription plan with:", planData);
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
      token
    );
    console.log("Created subscription plan:", data.data);
    return data.data;
  } catch (error: any) {
    console.error("Error creating subscription plan:", error);
    throw new Error(error.response?.data?.message || "Failed to create subscription plan");
  }
};

export const updateSubscriptionPlan = async (
  productId: string,
  planData: { name: string; description?: string; price: number; interval: "month" | "year" },
  token?: string
): Promise<SubscriptionPlan> => {
  console.log("Updating subscription plan with:", { productId, planData });
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
      token
    );
    console.log("Updated subscription plan:", data.data);
    return data.data;
  } catch (error: any) {
    console.error("Error updating subscription plan:", error);
    throw new Error(error.response?.data?.message || "Failed to update subscription plan");
  }
};

export const archiveSubscriptionPlan = async (productId: string, token?: string): Promise<void> => {
  console.log("Archiving subscription plan with productId:", productId);
  try {
    await apiCall<{ status: number }>(
      adminApi,
      HTTP_METHODS.POST,
      `/stripe/products/delete?productId=${productId}`,
      undefined,
      token
    );
    console.log("Subscription plan archived successfully");
  } catch (error: any) {
    console.error("Error archiving subscription plan:", error);
    throw new Error(error.response?.data?.message || "Failed to archive subscription plan");
  }
};
export const fetchAllArtistsVerification = async (token:string): Promise<any> => {
  try {
    const response = await apiCall<{ data: any }>(
      adminApi,
      HTTP_METHODS.GET,
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



// Update verification status
export const updateVerificationStatus = async (
  status: "approved" | "rejected" | "pending" | "unsubmitted",
  feedback: string | null,
  id: string,
  token: string
): Promise<any> => {
  try {
    console.log("Service called with:", { status, feedback, id, token });
    const response = await apiCall(
      adminApi,
      HTTP_METHODS.PUT,
      `/updateVerificationStatus?id=${id}`,
      { status, feedback },
      token
    );
    return response;
  } catch (error) {
    console.error("Error in updateVerificationStatus service:", error);
    throw error;
  }
};