"use client";

import { useState, useEffect } from "react";
import { Volume2, VolumeX, Music, Undo } from "lucide-react";
import Sidebar from "./userComponents/SideBar";
import { audio, audioContext, updateEqualizer, resetEqualizer } from "../../utils/audio";
import Chart from "react-apexcharts"; // Import ApexCharts

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
    pop: [2, 3, 4, 2, 1, 0, 1, 2, 3, 2],
    classical: [1, 2, 2, 1, 0, -1, -1, 0, 1, 2],
    jazz: [3, 3, 2, 1, 0, 1, 2, 2, 1, 0],
  };

  const [equalizerValues, setEqualizerValues] = useState(() => {
    const saved = localStorage.getItem("equalizerValues");
    return saved ? JSON.parse(saved) : bands.map((band) => band.defaultValue);
  });
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem("volume");
    return saved ? Number(saved) : 75;
  });
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem("isMuted");
    return saved ? JSON.parse(saved) : false;
  });
  const [activePreset, setActivePreset] = useState(() => {
    const saved = localStorage.getItem("activePreset");
    return saved ? saved : "custom";
  });

  useEffect(() => {
    if (!audioContext) return;

    const resumeAudioContext = () => {
      if (audioContext && audioContext.state === "suspended") {
        audioContext.resume().then(() => console.log("AudioContext resumed"));
      }
    };
    document.addEventListener("click", resumeAudioContext, { once: true });

    audio.crossOrigin = "anonymous";
    if (!audio.src) {
      audio.src = "/music/test.mp3";
      audio.loop = true;
    }
    audio.play().catch((err) => console.error("Play error:", err));

    updateEqualizer(equalizerValues);

    return () => {
      document.removeEventListener("click", resumeAudioContext);
    };
  }, [equalizerValues]);

  useEffect(() => {
    audio.volume = isMuted ? 0 : volume / 100;
    console.log("Volume set to:", audio.volume, "Muted:", isMuted);
  }, [volume, isMuted]);

  useEffect(() => {
    localStorage.setItem("equalizerValues", JSON.stringify(equalizerValues));
    updateEqualizer(equalizerValues);
  }, [equalizerValues]);

  useEffect(() => {
    localStorage.setItem("volume", volume.toString());
  }, [volume]);

  useEffect(() => {
    localStorage.setItem("isMuted", JSON.stringify(isMuted));
  }, [isMuted]);

  useEffect(() => {
    localStorage.setItem("activePreset", activePreset);
  }, [activePreset]);

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

  const resetEqualizerSettings = () => {
    setEqualizerValues(presets.flat);
    setActivePreset("flat");
    resetEqualizer();
  };

  // ApexCharts configuration
  const chartOptions = {
    chart: {
      type: "area" as const, // Smooth area chart
      height: 150,
      background: "#1f2937", // bg-gray-800
      toolbar: {
        show: false, // Hide toolbar
      },
    },
    stroke: {
      curve: "smooth" as const, // Smooth curve like your SVG
      width: 3,
      colors: ["#ffffff"], // White line
    },
    fill: {
      type: "solid",
      opacity: 0.1,
      colors: ["#ffffff"], // Slight white fill
    },
    xaxis: {
      categories: bands.map((band) => band.name), // 32Hz to 16kHz
      labels: {
        style: {
          colors: "#9ca3af", // Light gray labels
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      min: -12,
      max: 12,
      tickAmount: 4, // -12, -6, 0, 6, 12
      labels: {
        style: {
          colors: "#9ca3af",
        },
      },
      axisBorder: {
        show: false,
      },
    },
    grid: {
      borderColor: "#6b7280", // Gray grid lines
      strokeDashArray: 4, // Dashed lines
      yaxis: {
        lines: {
          show: true,
        },
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    tooltip: {
      enabled: false, // Disable tooltips
    },
    dataLabels: {
      enabled: false, // Hide data labels
    },
  };

  const chartSeries = [
    {
      name: "Equalizer",
      data: equalizerValues, // Y-axis values
    },
  ];

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <div className="flex-1 ml-64 py-8 px-6">
        <div className="bg-gray-900 border border-gray-700 rounded-lg">
          <div className="border-b border-gray-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                  <Music className="h-6 w-6" /> Audio Equalizer
                </h2>
                <p className="text-gray-400">Customize your sound experience</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={resetEqualizerSettings}
                  className="bg-gray-800 text-gray-400 border border-gray-600 hover:bg-gray-700 hover:text-white transition w-10 h-10 flex items-center justify-center rounded-full"
                >
                  <Undo className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="mb-8">
              <div className="bg-gray-800 border border-gray-700 rounded-lg flex flex-wrap gap-2 p-2">
                {[
                  "flat",
                  "bass",
                  "treble",
                  "vocal",
                  "electronic",
                  "rock",
                  "pop",
                  "classical",
                  "jazz",
                  "custom",
                ].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => applyPreset(preset as keyof typeof presets | "custom")}
                    className={`text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-600 rounded-md px-3 py-1 transition ${
                      activePreset === preset ? "bg-gray-600 text-white" : ""
                    }`}
                  >
                    {preset.charAt(0).toUpperCase() + preset.slice(1).replace("bass", "Bass Boost").replace("treble", "Treble Boost")}
                  </button>
                ))}
              </div>
            </div>
            {/* Replace SVG with ApexCharts */}
            <div className="w-full h-[150px] mb-8 bg-gray-800 rounded-lg border border-gray-700 p-4 relative overflow-hidden">
              <Chart options={chartOptions} series={chartSeries} type="area" height={150} />
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
                className="flex-1 h-2 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
              />
              <span className="text-sm text-gray-400 w-8 text-right">{isMuted ? "0" : volume}%</span>
            </div>
            <div className="mb-10 bg-gray-800 p-20 rounded-lg border border-gray-700 overflow-x-auto">
              <div className="flex space-x-4 min-w-max">
                {bands.map((band, index) => (
                  <div key={band.frequency} className="flex flex-col items-center gap-2 w-20">
                    <input
                      type="range"
                      min={-12}
                      max={12}
                      step={1}
                      value={equalizerValues[index]}
                      onChange={(e) => handleSliderChange(index, e.target.value)}
                      className="w-32 h-2 bg-gray-700 rounded-full appearance-none cursor-pointer rotate-270 transform origin-center [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                    />
                    <div className="text-center mt-15">
                      <div className="text-xs font-medium text-white">{band.name}</div>
                      <div className="text-xs text-gray-400">
                        {equalizerValues[index] > 0 ? "+" : ""}
                        {equalizerValues[index]} dB
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}