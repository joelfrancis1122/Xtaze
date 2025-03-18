"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Volume2, VolumeX, Music, Save, Undo } from "lucide-react"

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
  ]

  const presets = {
    flat: bands.map(() => 0),
    bass: [6, 5, 4, 2, 1, 0, 0, 0, 0, 0],
    treble: [0, 0, 0, 0, 0, 1, 2, 4, 5, 6],
    vocal: [-2, -2, 0, 2, 4, 4, 2, 0, -2, -2],
    electronic: [4, 3, 0, -2, -2, 0, 2, 3, 4, 4],
    rock: [3, 2, 0, -1, -2, 0, 2, 3, 3, 2],
  }

  const [equalizerValues, setEqualizerValues] = useState(bands.map((band) => band.defaultValue))
  const [volume, setVolume] = useState(75)
  const [isMuted, setIsMuted] = useState(false)
  const [activePreset, setActivePreset] = useState("custom")

  const applyPreset = (presetName) => {
    if (presets[presetName]) {
      setEqualizerValues(presets[presetName])
      setActivePreset(presetName)
    }
  }

  const handleSliderChange = (index, value) => {
    const newValues = [...equalizerValues]
    newValues[index] = value[0]
    setEqualizerValues(newValues)
    setActivePreset("custom")
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const resetEqualizer = () => {
    setEqualizerValues(presets.flat)
    setActivePreset("flat")
  }

  const getVisualizationPath = () => {
    const width = 600
    const height = 150
    const points = equalizerValues.map((value, index) => {
      const x = (index / (equalizerValues.length - 1)) * width
      const y = height / 2 - (value * height) / 24
      return `${x},${y}`
    })

    let path = `M ${points[0]}`
    for (let i = 0; i < points.length - 1; i++) {
      const [x1, y1] = points[i].split(",").map(Number)
      const [x2, y2] = points[i + 1].split(",").map(Number)
      const xc = (x1 + x2) / 2
      const yc = (y1 + y2) / 2
      path += ` Q ${x1},${y1} ${xc},${yc}`
    }
    path += ` L ${points[points.length - 1]}`

    return path
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Assuming Sidebar from Xtaze */}
      <div className="flex-1 ml-64 py-8 px-6">
        <Card className="bg-gray-900 text-white border-gray-800">
          <CardHeader className="border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Music className="h-6 w-6" /> Audio Equalizer
                </CardTitle>
                <CardDescription className="text-gray-400">Customize your sound experience</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={resetEqualizer}
                  className="bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-white transition"
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-white transition"
                >
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Presets */}
            <Tabs defaultValue="custom" value={activePreset} className="mb-8">
              <TabsList className="bg-gray-800 border-gray-700 rounded-lg flex flex-wrap gap-2 p-2">
                <TabsTrigger 
                  value="flat" 
                  onClick={() => applyPreset("flat")}
                  className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-md px-3 py-1 transition data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Flat
                </TabsTrigger>
                <TabsTrigger 
                  value="bass" 
                  onClick={() => applyPreset("bass")}
                  className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-md px-3 py-1 transition data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Bass Boost
                </TabsTrigger>
                <TabsTrigger 
                  value="treble" 
                  onClick={() => applyPreset("treble")}
                  className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-md px-3 py-1 transition data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Treble Boost
                </TabsTrigger>
                <TabsTrigger 
                  value="vocal" 
                  onClick={() => applyPreset("vocal")}
                  className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-md px-3 py-1 transition data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Vocal
                </TabsTrigger>
                <TabsTrigger 
                  value="electronic" 
                  onClick={() => applyPreset("electronic")}
                  className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-md px-3 py-1 transition data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Electronic
                </TabsTrigger>
                <TabsTrigger 
                  value="rock" 
                  onClick={() => applyPreset("rock")}
                  className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-md px-3 py-1 transition data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Rock
                </TabsTrigger>
                <TabsTrigger 
                  value="custom"
                  className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-md px-3 py-1 transition data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Custom
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Visualization */}
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

            {/* Volume control */}
            <div className="flex items-center gap-4 mb-8 bg-gray-800 p-4 rounded-lg border border-gray-700">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-gray-400 hover:text-white hover:bg-gray-700 transition"
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                min={0}
                max={100}
                step={1}
                className="flex-1 text-blue-600"
                onValueChange={(value) => {
                  setVolume(value[0])
                  if (value[0] > 0 && isMuted) setIsMuted(false)
                }}
              />
              <span className="text-sm text-gray-400 w-8 text-right">{isMuted ? 0 : volume}%</span>
            </div>

            {/* Equalizer sliders */}
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-6">
              {bands.map((band, index) => (
                <div key={band.frequency} className="flex flex-col items-center gap-2">
                  <div className="h-[200px] flex items-center">
                    <Slider
                      value={[equalizerValues[index]]}
                      min={-12}
                      max={12}
                      step={1}
                      orientation="vertical"
                      className="h-full text-blue-600"
                      onValueChange={(value) => handleSliderChange(index, value)}
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-white">{band.name}</div>
                    <div className="text-xs text-gray-400">
                      {equalizerValues[index] > 0 ? "+" : ""}
                      {equalizerValues[index]} dB
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}