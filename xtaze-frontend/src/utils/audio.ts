// utils/audio.ts
export const audio = new Audio();
export const audioContext = typeof AudioContext !== "undefined" ? new AudioContext() : null;
export const source = audioContext ? audioContext.createMediaElementSource(audio) : null;

const bands = [
  { name: "32Hz", frequency: 32, defaultValue: 0 },
  { name: "64Hz", frequency: 64, defaultValue: 0 },
  { name: "125Hz", frequency: 125, defaultValue: 0 },
  { name: "250Hz", frequency: 250, defaultValue: 0 },
  { name: "500Hz", frequency: 500, defaultValue: 0 },
  { name: "1kHz", frequency: 1000, defaultValue: 0 },
  { name: "2kHz", frequency: 2000, defaultValue: 0 },
  { name: "4kHz", frequency: 4000, defaultValue: 0 },
  { name: "8kHz", frequency: 8000, defaultValue: 0 },
  { name: "16kHz", frequency: 16000, defaultValue: 0 },
];

// Global filters array
export const filters: BiquadFilterNode[] = audioContext
  ? bands.map((band) => {
      const filter = audioContext.createBiquadFilter();
      filter.type = "peaking";
      filter.frequency.value = band.frequency;
      filter.Q.value = 1.4;
      filter.gain.value = band.defaultValue;
      return filter;
    })
  : [];

// Connect the audio chain once at initialization
if (audioContext && source) {
  const lastNode = filters.reduce<AudioNode>((prev, curr) => prev.connect(curr), source);
  lastNode.connect(audioContext.destination);
}

// Function to update filter gains based on equalizer values
export const updateEqualizer = (values: number[]) => {
  if (filters.length === 0) return;
  filters.forEach((filter, index) => {
    filter.gain.value = values[index] || 0;
  });
};

// Function to reset equalizer to flat
export const resetEqualizer = () => {
  if (filters.length === 0) return;
  filters.forEach((filter) => {
    filter.gain.value = 0;
  });
};