// redux/audioSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Track } from "../pages/User/Types";

interface AudioState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffled: boolean;
  isRepeating: boolean;
  shuffleIndices: number[];
  currentShuffleIndex: number;
}

const initialState: AudioState = {
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isShuffled: false,
  isRepeating: false,
  shuffleIndices: [],
  currentShuffleIndex: 0,
};

const audioSlice = createSlice({
  name: "audio",
  initialState,
  reducers: {
    setCurrentTrack(state, action: PayloadAction<Track | null>) {
      state.currentTrack = action.payload;
    },
    setIsPlaying(state, action: PayloadAction<boolean>) {
      state.isPlaying = action.payload;
    },
    setCurrentTime(state, action: PayloadAction<number>) {
      state.currentTime = action.payload;
    },
    setDuration(state, action: PayloadAction<number>) {
      state.duration = action.payload;
    },
    setVolume(state, action: PayloadAction<number>) {
      state.volume = action.payload;
    },
    toggleShuffle(state) {
      state.isShuffled = !state.isShuffled;
      if (!state.isShuffled) {
        state.shuffleIndices = [];
        state.currentShuffleIndex = 0;
      }
    },
    setShuffleIndices(state, action: PayloadAction<number[]>) {
      state.shuffleIndices = action.payload;
    },
    setCurrentShuffleIndex(state, action: PayloadAction<number>) {
      state.currentShuffleIndex = action.payload;
    },
    toggleRepeat(state) {
      state.isRepeating = !state.isRepeating;
    },
    clearAudioState(state) {
      state.currentTrack= null;
      state.isPlaying= false;
      state.currentTime= 0;
      state.duration= 0;
      state. volume= 1;
      state.isShuffled= false;
      state.isRepeating= false;
      state.shuffleIndices= [];
      state.currentShuffleIndex= 0;
    }

  },
});

export const {
  setCurrentTrack,
  setIsPlaying,
  setCurrentTime,
  setDuration,
  setVolume,
  toggleShuffle,
  setShuffleIndices,
  setCurrentShuffleIndex,
  toggleRepeat,
  clearAudioState,
} = audioSlice.actions;

export default audioSlice.reducer;