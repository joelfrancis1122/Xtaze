// store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../redux/userSlice";
import adminReducer from "../redux/adminSlice";
import artistReducer from "../redux/artistSlice";
import audioReducer from "../redux/audioSlice";
import { persistStore, persistReducer } from "redux-persist";
import { combineReducers } from "redux";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user", "audio"], 
};

const rootReducer = combineReducers({
  user: userReducer,
  admin: adminReducer,
  artist: artistReducer,
  audio: audioReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;