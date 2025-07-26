import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

interface AdminState {
  signupData: {
    username: string;
    country: string;
    gender: string;
    year: string;
    phone: string;
    email: string;
    role?: string; // Added role
    isActive?: boolean; // Added isActive
    premium?: boolean;
  } | null;
}

const initialState: AdminState = {
  signupData: null,
};

const AdminSlice = createSlice({
  name: "Admin",
  initialState,
  reducers: {
    saveAdminData: (state, action: PayloadAction<AdminState["signupData"]>) => {
      state.signupData = action.payload;
    },
    clearAdminData: (state) => {
      state.signupData = null;
    },
  },
});

const persistConfig = {
  key: "Admin",
  storage,
};

export const { saveAdminData, clearAdminData } = AdminSlice.actions;
export default persistReducer(persistConfig, AdminSlice.reducer);
