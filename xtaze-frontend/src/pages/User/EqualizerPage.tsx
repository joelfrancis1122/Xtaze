import { useState, useEffect } from "react";
import { Music, Undo } from "lucide-react";
import { audio, audioContext, updateEqualizer, resetEqualizer } from "../../utils/audio";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import ReactApexChartOriginal from "react-apexcharts";
import MusicPlayer from "./userComponents/TrackBar";
import PreviewModal from "./PreviewPage";
import { useAudioPlayback } from "./userComponents/audioPlayback";
import { Track } from "./types/ITrack";
import SidebarX from "./userComponents/Sidebr";

const ReactApexChart = ReactApexChartOriginal as unknown as React.FC<{
  options: ApexCharts.ApexOptions;
  series: ApexCharts.ApexOptions["series"];
  type: string;
  height?: number | string;
  width?: number | string;
}>;

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

  const [activePreset, setActivePreset] = useState(() => {
    const saved = localStorage.getItem("activePreset");
    return saved ? saved : "custom";
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const { currentTrack, isPlaying, isShuffled, isRepeating } = useSelector(
    (state: RootState) => state.audio
  );
  const {
    handlePlay: baseHandlePlay,
    handleSkipBack,
    handleSkipForward,
    handleToggleShuffle,
    handleToggleRepeat,
  } = useAudioPlayback([]);

  const toggleModal = () => setIsModalOpen((prev) => !prev);

  const handlePlayFromModal = (track: Track) => baseHandlePlay(track);

  useEffect(() => {
    if (!audioContext) return;

    const resumeAudioContext = () => {
      if (audioContext && audioContext.state === "suspended") {
        audioContext.resume().then(() => console.log("AudioContext resumed"));
      }
    };
    document.addEventListener("click", resumeAudioContext, { once: true });

    audio.crossOrigin = "anonymous";
    if (!audio.src && currentTrack) {
      audio.src = currentTrack.fileUrl;
    } else if (!audio.src) {
      audio.src = "/music/test.mp3";
      audio.loop = true;
    }

    updateEqualizer(equalizerValues);
    return () => document.removeEventListener("click", resumeAudioContext);
  }, [equalizerValues, currentTrack]);

  useEffect(() => {
    localStorage.setItem("equalizerValues", JSON.stringify(equalizerValues));
    updateEqualizer(equalizerValues);
  }, [equalizerValues]);

  useEffect(() => {
    localStorage.setItem("activePreset", JSON.stringify(activePreset));
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
    const newValues = [...equalizerValues];
    newValues[index] = Number(value);
    setEqualizerValues(newValues);
    setActivePreset("custom");
  };

  const resetEqualizerSettings = () => {
    setEqualizerValues(presets.flat);
    setActivePreset("flat");
    resetEqualizer();
  };

  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "area",
      height: 200,
      background: "transparent",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    stroke: { curve: "smooth", width: 3, colors: ["#ef4444"] },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 100],
      },
    },
    xaxis: {
      categories: bands.map((band) => band.name),
      labels: { style: { colors: "#6b7280", fontSize: "12px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: -12,
      max: 12,
      tickAmount: 6,
      labels: {
        style: { colors: "#6b7280", fontSize: "12px" },
        formatter: (v) => `${v > 0 ? "+" : ""}${v}dB`,
      },
    },
    grid: {
      borderColor: "#374151",
      strokeDashArray: 2,
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: true } },
    },
    tooltip: {
      enabled: true,
      theme: "dark",
      y: { formatter: (v) => `${v > 0 ? "+" : ""}${v} dB` },
    },
    dataLabels: { enabled: false },
  };

  const chartSeries: ApexCharts.ApexOptions["series"] = [
    { name: "Frequency Response", data: equalizerValues },
  ];

  const presetLabels: Record<string, string> = {
    flat: "Flat",
    bass: "Bass Boost",
    treble: "Treble Boost",
    vocal: "Vocal",
    electronic: "Electronic",
    rock: "Rock",
    pop: "Pop",
    classical: "Classical",
    jazz: "Jazz",
    custom: "Custom",
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <SidebarX>
        <div className="max-w-max mx-auto">
          <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-full">

            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                  <Music className="h-6 w-6 md:h-7 md:w-7 text-red-500" />
                  Audio Equalizer
                </h1>
                <p className="text-gray-400 mt-2">
                  Fine-tune your sound experience with precision
                </p>
              </div>
              <button
                onClick={resetEqualizerSettings}
                className="bg-gray-950 hover:bg-gray-700 text-gray-300 hover:text-white px-4 py-2 rounded-lg border border-gray-700 flex items-center gap-2"
              >
                <Undo className="h-4 w-4" />
                Reset
              </button>
            </div>

            {/* Presets */}
            <div className="bg-gray-950/50 border border-y-gray-950 rounded-xl p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4">Sound Presets</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3">
                {Object.keys(presets).concat(["custom"]).map((preset) => (
                  <button
                    key={preset}
                    onClick={() =>
                      applyPreset(preset as keyof typeof presets | "custom")
                    }
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${activePreset === preset
                        ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/25"
                        : "bg-gray-950 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white"
                      }`}
                  >
                    {presetLabels[preset]}
                  </button>
                ))}
              </div>
            </div>

            {/* Frequency Response Chart */}
            <div className="bg-gray-950/50 border border-gray-950 rounded-xl p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4">Frequency Response</h2>
              <div className="bg-black/30 rounded-lg p-4 border border-gray-950 w-auto">
                <ReactApexChart
                  options={chartOptions}
                  series={chartSeries}
                  type="area"
                  height={200}
                />
              </div>
            </div>

            {/* Equalizer Controls */}
            <div className="bg-gray-950/50 border border-gray-950 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-6">Equalizer Controls</h2>
              <div className="overflow-x-auto pb-4">
                <div className="flex justify-center min-w-max px-4">
                  <div className="flex space-x-6 md:space-x-8">
                    {bands.map((band, index) => (
                      <div
                        key={band.frequency}
                        className="flex flex-col items-center"
                      >
                        <div className="mb-2 h-8 flex items-center">
                          <span
                            className={`text-sm font-medium px-2 py-1 rounded ${equalizerValues[index] > 0
                                ? "text-green-400 bg-green-500/10"
                                : equalizerValues[index] < 0
                                  ? "text-red-400 bg-red-500/10"
                                  : "text-gray-400 bg-gray-500/10"
                              }`}
                          >
                            {equalizerValues[index] > 0 ? "+" : ""}
                            {equalizerValues[index]}dB
                          </span>
                        </div>

                        {/* Slider */}
                        <div className="relative h-48 flex items-center">
                         <input
  type="range"
  min={-12}
  max={12}
  step={1}
  value={equalizerValues[index]}
  onChange={(e) => handleSliderChange(index, e.target.value)}
  className="w-24 h-1 rounded-full appearance-none cursor-pointer rotate-270 transform origin-center bg-[#1f2937] border-zinc-900 
    [&::-webkit-slider-runnable-track]:bg-red-500 
    [&::-webkit-slider-runnable-track]:h-1 
    [&::-webkit-slider-runnable-track]:rounded-full 
    [&::-webkit-slider-runnable-track]:opacity-50 
    [&::-moz-range-track]:bg-white 
    [&::-moz-range-track]:h-1 
    [&::-moz-range-track]:rounded-full 
    [&::-moz-range-track]:opacity-50 

    /* 🔴 Thumb (Chrome, Safari, Edge) */
    [&::-webkit-slider-thumb]:appearance-none 
    [&::-webkit-slider-thumb]:w-4 
    [&::-webkit-slider-thumb]:h-4 
    [&::-webkit-slider-thumb]:bg-red-500 
    [&::-webkit-slider-thumb]:rounded-full 
    [&::-webkit-slider-thumb]:border-2 
    [&::-webkit-slider-thumb]:border-white 
    [&::-webkit-slider-thumb]:shadow-md 
    [&::-webkit-slider-thumb]:-mt-[6px] 

    /* 🔴 Thumb (Firefox) */
    [&::-moz-range-thumb]:w-4 
    [&::-moz-range-thumb]:h-4 
    [&::-moz-range-thumb]:bg-red-500 
    [&::-moz-range-thumb]:rounded-full 
    [&::-moz-range-thumb]:border-2 
    [&::-moz-range-thumb]:border-white 
    [&::-moz-range-thumb]:shadow-md 
    [&::-moz-range-thumb]:-mt-[6px]"
/>

                        </div>

                        <div className="mt-2 text-xs font-medium text-white">
                          {band.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarX>

      {/* Music Player */}
      {currentTrack && (
        <MusicPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          handlePlay={baseHandlePlay}
          handleSkipBack={handleSkipBack}
          handleSkipForward={handleSkipForward}
          toggleShuffle={handleToggleShuffle}
          toggleRepeat={handleToggleRepeat}
          isShuffled={isShuffled}
          isRepeating={isRepeating}
          audio={audio}
          toggleModal={toggleModal}
        />
      )}

      {/* Preview Modal */}
      {currentTrack && (
        <PreviewModal
          track={currentTrack}
          isOpen={isModalOpen}
          toggleModal={toggleModal}
          onPlayTrack={handlePlayFromModal}
        />
      )}
    </div>
  );
}
