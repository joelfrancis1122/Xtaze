import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

interface ArtistState {
  signupData: {
    _id:string;
    username: string;
    country: string;
    gender: string;
    year: string;
    phone: string;
    email: string;
    role?: string;
    isActive?: boolean;
    premium?: boolean;
    profilePic:String;
    bio:String;
    banner:String;

  } | null;
}

const initialState: ArtistState = {
  signupData: null,
};

const ArtistSlice = createSlice({
  name: "Artist",
  initialState,
  reducers: {
    saveArtistData: (state, action: PayloadAction<ArtistState["signupData"]>) => {
      state.signupData = action.payload;
    },
    clearArtistData: (state) => {
      state.signupData = null;
    },
  },
});

const persistConfig = {
  key: "Artist",
  storage,
};

export const { saveArtistData, clearArtistData } = ArtistSlice.actions;
export default persistReducer(persistConfig, ArtistSlice.reducer);
