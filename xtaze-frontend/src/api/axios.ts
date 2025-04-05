import axios from "axios";

const axiosBaseConfig = {
  baseURL: import.meta.env.VITE_BASE_URL || "https://api.xtaze.fun",
  timeout: 30000,
};

// User API instance
export const userApi = axios.create({
  ...axiosBaseConfig,
  baseURL: `${axiosBaseConfig.baseURL}/user`,
});

// Admin API instance
export const adminApi = axios.create({
  ...axiosBaseConfig,
  baseURL: `${axiosBaseConfig.baseURL}/admin`,
});
// Artist API instance
export const artistApi = axios.create({
  ...axiosBaseConfig,
  baseURL: `${axiosBaseConfig.baseURL}/artist`,
});
export const providerApi = axios.create({
  ...axiosBaseConfig,
  baseURL: `${axiosBaseConfig.baseURL}/provider`,
});
export const deezerApi = axios.create({
  ...axiosBaseConfig,
  baseURL: `${axiosBaseConfig.baseURL}/api`,
});

