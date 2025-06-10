import { useState, useEffect } from "react";
import { Music, Undo } from "lucide-react";
import Sidebar from "./userComponents/SideBar";
import { audio, audioContext, updateEqualizer, resetEqualizer } from "../../utils/audio";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useNavigate } from "react-router-dom";
import ReactApexChartOriginal from "react-apexcharts";
import MusicPlayer from "./userComponents/TrackBar";
import PreviewModal from "./PreviewPage";
import { useAudioPlayback } from "./userComponents/audioPlayback";
import { Track } from "./types/ITrack";

// Type assertion for ReactApexChart
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [equalizerValues, setEqualizerValues] = useState(() => {
    const saved = localStorage.getItem("equalizerValues");
    return saved ? JSON.parse(saved) : bands.map((band) => band.defaultValue);
  });
  const [activePreset, setActivePreset] = useState(() => {
    const saved = localStorage.getItem("activePreset");
    return saved ? saved : "custom";
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentTrack, isPlaying, isShuffled, isRepeating } = useSelector((state: RootState) => state.audio);
  const navigate = useNavigate();
  const {
    handlePlay: baseHandlePlay,
    handleSkipBack,
    handleSkipForward,
    handleToggleShuffle,
    handleToggleRepeat,
  } = useAudioPlayback([]);

  const toggleModal = () => {
    setIsModalOpen((prevState) => !prevState);
  };

  const handlePlayFromModal = (track: Track) => {
    baseHandlePlay(track);
  };

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

    return () => {
      document.removeEventListener("click", resumeAudioContext);
    };
  }, [equalizerValues, currentTrack]);

  useEffect(() => {
    localStorage.setItem("equalizerValues", JSON.stringify(equalizerValues));
    updateEqualizer(equalizerValues);
  }, [equalizerValues]);

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
      height: 110,
      background: "#000000",
      toolbar: { show: false },
    },
    stroke: {
      curve: "smooth",
      width: 2,
      colors: ["#ff0000"],
    },
    fill: {
      type: "solid",
      opacity: 0.1,
      colors: ["#ff0000"],
    },
    xaxis: {
      categories: bands.map((band) => band.name),
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: -12,
      max: 12,
      tickAmount: 4,
      labels: {
        style: { colors: "#9ca3af", fontSize: "10px" },
        offsetX: -5,
      },
      axisBorder: { show: false },
    },
    grid: {
      borderColor: "#000000",
      strokeDashArray: 4,
      padding: { top: 0, bottom: 0, left: 10, right: 10 },
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
    },
    tooltip: { enabled: false },
    dataLabels: { enabled: false },
  };

  const chartSeries: ApexCharts.ApexOptions["series"] = [
    {
      name: "Equalizer",
      data: equalizerValues,
    },
  ];

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      <div className="flex-1 md:ml-[240px] px-4 sm:px-6 py-6 sm:py-8 pb-20 bg-black">
        <nav className="md:hidden text-sm text-gray-400 mb-4 sm:mb-6">
          <a
            href="/home"
            className="hover:text-white transition-colors"
            onClick={(e) => {
              e.preventDefault();
              navigate("/home");
            }}
          >
            Home
          </a>
          <span className="mx-2"></span>
          <span className="text-white">Equalizer</span>
        </nav>
        <div className="bg-black border border-[#1f2937] rounded-lg">
          <div className="border-b border-[#1f2937] p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-white">
                  <Music className="h-5 w-5 sm:h-6 sm:w-6" /> Audio Equalizer
                </h2>
                <p className="text-gray-400 text-sm sm:text-base">Customize your sound experience</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={resetEqualizerSettings}
                  className="bg-black text-gray-400 border border-[#1f2937] hover:bg-[#1f2937] active:bg-[#1f2937] hover:text-white transition w-12 h-12 sm:w-10 sm:h-10 flex items-center justify-center rounded-full"
                >
                  <Undo className="h-5 w-5 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="mb-6 sm:mb-8">
              <div className="bg-black border border-[#1f2937] rounded-lg flex flex-wrap gap-2 sm:gap-3 p-2 sm:p-3">
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
                    className={`text-sm sm:text-base text-gray-400 hover:text-white bg-black hover:bg-[#1f2937] active:bg-[#1f2937] rounded-md px-3 sm:px-4 py-2 sm:py-1 transition ${activePreset === preset ? "bg-[#1f2937] text-white" : ""}`}
                  >
                    {preset.charAt(0).toUpperCase() + preset.slice(1).replace("bass", "Bass Boost").replace("treble", "Treble Boost")}
                  </button>
                ))}
              </div>
            </div>
            <div className="w-full h-[120px] sm:h-[150px] mb-6 sm:mb-10 bg-black rounded-lg border border-[#1f2937] relative">
              <div className="p-2 pb-6">
                <ReactApexChart
                  options={chartOptions}
                  series={chartSeries}
                  type="area"
                  height={110}
                  width="100%"
                />
              </div>
              <div className="absolute bottom-1 left-0 right-0 flex justify-between px-4 text-[10px] sm:text-xs text-gray-500">
                {bands.map((band) => (
                  <div key={band.frequency}>{band.name}</div>
                ))}
              </div>
            </div>

            <div className="mb-6 sm:mb-10 bg-black p-4 sm:p-6 rounded-lg border border-[#1f2937]">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-6">
                {bands.map((band, index) => (
                  <div key={band.frequency} className="flex flex-col items-center gap-2">
                    <input
                      type="range"
                      min={-12}
                      max={12}
                      step={1}
                      value={equalizerValues[index]}
                      onChange={(e) => handleSliderChange(index, e.target.value)}
                      className="w-full h-2 sm:h-1 rounded-full appearance-none cursor-pointer bg-[#1f2937]
                        [&::-webkit-slider-runnable-track]:bg-red-500 
                        [&::-webkit-slider-runnable-track]:h-2 sm:h-1 
                        [&::-webkit-slider-runnable-track]:rounded-full 
                        [&::-webkit-slider-runnable-track]:opacity-50 
                        [&::-moz-range-track]:bg-white 
                        [&::-moz-range-track]:h-2 sm:h-1 
                        [&::-moz-range-track]:rounded-full 
                        [&::-moz-range-track]:opacity-50 
                        [&::-webkit-slider-thumb]:appearance-none 
                        [&::-webkit-slider-thumb]:w-5 sm:w-4 
                        [&::-webkit-slider-thumb]:h-5 sm:h-4 
                        [&::-webkit-slider-thumb]:bg-red-500 
                        [&::-webkit-slider-thumb]:rounded-full 
                        [&::-webkit-slider-thumb]:opacity-100 
                        [&::-webkit-slider-thumb]:-mt-[6px] 
                        [&::-moz-range-thumb]:w-5 sm:w-4 
                        [&::-moz-range-thumb]:h-5 sm:h-4 
                        [&::-moz-range-thumb]:bg-white 
                        [&::-moz-range-thumb]:rounded-full 
                        [&::-moz-range-thumb]:opacity-100 
                        [&::-moz-range-thumb]:-mt-[6px]"
                    />
                    <div className="text-center">
                      <div className="text-sm sm:text-xs font-medium text-white">{band.name}</div>
                      <div className="text-sm sm:text-xs text-red-400">
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