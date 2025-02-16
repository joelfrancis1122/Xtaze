import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

interface UserState {
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

const initialState: UserState = {
  signupData: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    saveSignupData: (state, action: PayloadAction<UserState["signupData"]>) => {
      state.signupData = action.payload;
    },
    clearSignupData: (state) => {
      state.signupData = null;
    },
  },
});

const persistConfig = {
  key: "user",
  storage,
};

export const { saveSignupData, clearSignupData } = userSlice.actions;
export default persistReducer(persistConfig, userSlice.reducer);
