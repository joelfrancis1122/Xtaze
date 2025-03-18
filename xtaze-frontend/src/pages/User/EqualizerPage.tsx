import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Music, Save, Undo } from "lucide-react";
import Sidebar from "./userComponents/SideBar";
import { audio, audioContext, source } from "../../utils/audio";

export default function EqualizerPage() {
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

  const presets = {
    flat: bands.map(() => 0),
    bass: [6, 5, 4, 2, 1, 0, 0, 0, 0, 0],
    treble: [0, 0, 0, 0, 0, 1, 2, 4, 5, 6],
    vocal: [-2, -2, 0, 2, 4, 4, 2, 0, -2, -2],
    electronic: [4, 3, 0, -2, -2, 0, 2, 3, 4, 4],
    rock: [3, 2, 0, -1, -2, 0, 2, 3, 3, 2],
  };

  const [equalizerValues, setEqualizerValues] = useState(bands.map((band) => band.defaultValue));
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [activePreset, setActivePreset] = useState("custom");
  const filtersRef = useRef<BiquadFilterNode[]>([]);

  useEffect(() => {
    if (!audioContext || !source) return;

    // Type narrowing ensures audioContext and source are not null here
    const ctx = audioContext as AudioContext;
    const src = source as MediaElementAudioSourceNode;

    const resumeAudioContext = () => {
      if (ctx.state === "suspended") {
        ctx.resume().then(() => console.log("AudioContext resumed"));
      }
    };
    document.addEventListener("click", resumeAudioContext, { once: true });

    console.log("AudioContext state:", ctx.state);
    console.log("Current audio src:", audio.src);
    audio.crossOrigin = "anonymous";
    if (!audio.src) {
      audio.src = "/music/test.mp3";
      audio.loop = true;
    }
    audio.play().catch((err) => console.error("Play error:", err));

    // Disconnect any existing connections from source
    src.disconnect();

    // Create and connect equalizer filters
    filtersRef.current = bands.map((band, index) => {
      const filter = ctx.createBiquadFilter();
      filter.type = "peaking";
      filter.frequency.value = band.frequency;
      filter.Q.value = 1.4;
      filter.gain.value = equalizerValues[index];
      return filter;
    });
    const lastNode = filtersRef.current.reduce<AudioNode>((prev, curr) => prev.connect(curr), src);
    lastNode.connect(ctx.destination);

    // Cleanup function
    return () => {
      src.disconnect();
      filtersRef.current.forEach((filter) => filter.disconnect());
      src.connect(ctx.destination); // Restore default connection
      document.removeEventListener("click", resumeAudioContext);
    };
  }, [equalizerValues]);

  useEffect(() => {
    if (filtersRef.current.length === 0) return;
    filtersRef.current.forEach((filter, index) => {
      filter.gain.value = equalizerValues[index];
    });
    audio.volume = isMuted ? 0 : volume / 100;
    console.log("Volume set to:", audio.volume, "Muted:", isMuted);
  }, [volume, isMuted]);

  const applyPreset = (presetName: keyof typeof presets | "custom") => {
    if (presetName === "custom") {
      setActivePreset("custom");
    } else if (presets[presetName]) {
      setEqualizerValues(presets[presetName]);
      setActivePreset(presetName);
    }
  };

  const handleSliderChange = (index: number, value: string) => {
    console.log("Slider moved:", index, value);
    const newValues = [...equalizerValues];
    newValues[index] = Number(value);
    setEqualizerValues(newValues);
    setActivePreset("custom");
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    console.log("Mute toggled to:", !isMuted);
  };

  const resetEqualizer = () => {
    setEqualizerValues(presets.flat);
    setActivePreset("flat");
  };

  const getVisualizationPath = () => {
    const width = 600;
    const height = 150;
    const points = equalizerValues.map((value, index) => {
      const x = (index / (equalizerValues.length - 1)) * width;
      const y = height / 2 - (value * height) / 24;
      return `${x},${y}`; // Fixed template literal syntax
    });

    let path = `M ${points[0]}`;
    for (let i = 0; i < points.length - 1; i++) {
      const [x1, y1] = points[i].split(",").map(Number);
      const [x2, y2] = points[i + 1].split(",").map(Number);
      const xc = (x1 + x2) / 2;
      const yc = (y1 + y2) / 2;
      path += ` Q ${x1},${y1} ${xc},${yc}`;
    }
    path += ` L ${points[points.length - 1]}`;

    return path;
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <div className="flex-1 ml-64 py-8 px-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg">
          <div className="border-b border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Music className="h-6 w-6" /> Audio Equalizer
                </h2>
                <p className="text-gray-400">Customize your sound experience</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={resetEqualizer}
                  className="bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700 hover:text-white transition w-10 h-10 flex items-center justify-center rounded-full"
                >
                  <Undo className="h-4 w-4" />
                </button>
                <button
                  className="bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700 hover:text-white transition w-10 h-10 flex items-center justify-center rounded-full"
                >
                  <Save className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="mb-8">
              <div className="bg-gray-800 border border-gray-700 rounded-lg flex flex-wrap gap-2 p-2">
                {["flat", "bass", "treble", "vocal", "electronic", "rock", "custom"].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => applyPreset(preset as keyof typeof presets | "custom")}
                    className={`text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-md px-3 py-1 transition ${
                      activePreset === preset ? "bg-blue-600 text-white" : ""
                    }`}
                  >
                    {preset.charAt(0).toUpperCase() + preset.slice(1).replace("bass", "Bass Boost").replace("treble", "Treble Boost")}
                  </button>
                ))}
              </div>
            </div>
            <div className="w-full h-[150px] mb-8 bg-gray-800 rounded-lg border border-gray-700 p-4 relative overflow-hidden">
              <svg width="100%" height="100%" viewBox="0 0 600 150" preserveAspectRatio="none">
                <line x1="0" y1="75" x2="600" y2="75" stroke="#4b5563" strokeWidth="1" />
                <line x1="0" y1="37.5" x2="600" y2="37.5" stroke="#4b5563" strokeWidth="0.5" strokeDasharray="4,4" />
                <line x1="0" y1="112.5" x2="600" y2="112.5" stroke="#4b5563" strokeWidth="0.5" strokeDasharray="4,4" />
                <path d={getVisualizationPath()} fill="none" stroke="#3b82f6" strokeWidth="3" />
              </svg>
              <div className="absolute bottom-1 left-0 right-0 flex justify-between px-4 text-xs text-gray-500">
                {bands.map((band) => (
                  <div key={band.frequency}>{band.name}</div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4 mb-8 bg-gray-800 p-4 rounded-lg border border-gray-700">
              <button
                onClick={toggleMute}
                className="bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition w-10 h-10 flex items-center justify-center rounded-full"
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(Number(e.target.value));
                    if (isMuted && Number(e.target.value) > 0) setIsMuted(false);
                  }}
                  className="flex-1 h-2 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:rounded-full"
                />
                <span className="text-sm text-gray-400 w-8 text-right">{isMuted ? "0" : volume}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
