// ../../utils/audio.ts
export const audio = new Audio();
export const audioContext = typeof window !== "undefined" ? new AudioContext() : null;
export const source = audioContext ? audioContext.createMediaElementSource(audio) : null;