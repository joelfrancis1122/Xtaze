"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Sidebar from "./userComponents/SideBar";
import { useNavigate } from "react-router-dom";
import { Play, Pause, Plus, Download } from "lucide-react";
import { getMyplaylist } from "../../services/userService";
import { toast } from "sonner";
import cd from "../../assets/cd.gif"
interface RadioStation {
  stationuuid: string;
  name: string;
  url: string;
  favicon: string;
}

interface Playlist {
  _id: string | number;
  title: string;
  description: string;
  imageUrl: string|null;
  createdBy: string;
  // tracks?:string[]
  videos?: string[];
}

export default function RadioPage() {
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentStationUrl, setCurrentStationUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dropdownStationId, setDropdownStationId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const stationRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [visibleStations, setVisibleStations] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const userId = "mockUserId"; // Replace with useSelector
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStationsAndPlaylists = async () => {
      if (!token) {
        console.error("No token found. Please login.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("https://de1.api.radio-browser.info/json/stations/bytag/chillout", {
          headers: { "User-Agent": "MyRadioApp/1.0" },
        });
        const data = await response.json();
        setStations(data.slice(0, 50));

        const fetchedPlaylists = await getMyplaylist(userId);
        setPlaylists(fetchedPlaylists);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load stations or playlists");
      } finally {
        setLoading(false);
      }
    };

    fetchStationsAndPlaylists();
  }, [userId, token]);

  const observer = useRef<IntersectionObserver | null>(null);
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const stationId = entry.target.getAttribute("data-station-id");
        if (stationId) setVisibleStations((prev) => new Set(prev).add(stationId));
      }
    });
  }, []);

  useEffect(() => {
    observer.current = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: "200px",
      threshold: 0.1,
    });

    Object.values(stationRefs.current).forEach((el) => {
      if (el) observer.current?.observe(el);
    });

    return () => observer.current?.disconnect();
  }, [stations]);

  const handlePlayStation = (station: RadioStation) => {
    if (currentStationUrl === station.url) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      audioRef.current.src = station.url;
      audioRef.current.play().catch((e) => {
        console.error("Playback error:", e);
        toast.error("Failed to play station");
      });
      setCurrentStationUrl(station.url);
      setIsPlaying(true);
    }
  };

  const addStationToPlaylist = async (userId: string, playlistId: string, stationId: string, token: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/playlists/${playlistId}/videos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ videoId: stationId }),
      });
      if (!response.ok) throw new Error("Failed to add station to playlist");
      return await response.json();
    } catch (error) {
      console.error("Error adding station to playlist:", error);
      throw error;
    }
  };

  const handleAddToPlaylist = async (stationId: string, playlistId: string) => {
    if (!token || !userId) {
      toast.error("Please log in to add to playlist");
      return;
    }
    try {
      await addStationToPlaylist(userId, playlistId, stationId, token);
      setPlaylists((prev) =>
        prev.map((playlist) =>
          playlist._id === playlistId
            ? { ...playlist, videos: [...(playlist.videos || []), stationId] }
            : playlist
        )
      );
      toast.success("Station added to playlist!");
      setDropdownStationId(null);
    } catch (error) {
      toast.error("Failed to add station to playlist");
    }
  };

  const handleDownload = (url: string, name: string) => {
    toast.error("Direct download not supported for radio streams. Save the URL instead.");
    console.log(`Would save stream URL: ${url} for ${name}`);
  };

  const renderStationCard = (station: RadioStation, index: number) => (
    <div
      key={station.stationuuid}
      ref={(el) => (stationRefs.current[station.stationuuid] = el)}
      data-station-id={station.stationuuid}
      className="group bg-[#1d1d1d] rounded-lg p-4 hover:bg-[#242424] transition-colors flex flex-col"
    >
      <div className="w-full h-[180px] mb-3 relative">
        {visibleStations.has(station.stationuuid) ? (
          <img
            src={cd} // Your GIF file
            alt={station.name}
            className="w-full h-full object-cover rounded-md"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-700 rounded-md flex items-center justify-center">
            Loading...
          </div>
        )}
      </div>
      <div className="text-white font-semibold truncate">{station.name}</div>
      <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity relative">
        <button
          className="p-1 hover:bg-[#333333] rounded-full"
          onClick={() => handlePlayStation(station)}
        >
          {currentStationUrl === station.url && isPlaying ? (
            <Pause size={16} />
          ) : (
            <Play size={16} />
          )}
        </button>
        <div className="relative">
          <button
            className="p-1 hover:bg-[#333333] rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              setDropdownStationId(dropdownStationId === station.stationuuid ? null : station.stationuuid);
            }}
          >
            <Plus size={16} />
          </button>
          {dropdownStationId === station.stationuuid && (
            <div className="absolute left-0 mt-2 w-48 bg-[#242424] rounded-md shadow-lg z-20">
              <ul className="py-1">
                {playlists.length > 0 ? (
                  playlists.map((playlist) => (
                    <li
                      key={playlist._id}
                      className="px-4 py-2 hover:bg-[#333333] cursor-pointer text-white"
                      onClick={() => handleAddToPlaylist(station.stationuuid, playlist._id.toString())}
                    >
                      {playlist.title}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-gray-400">No playlists available</li>
                )}
                <li
                  className="px-4 py-2 hover:bg-[#333333] cursor-pointer text-white border-t border-gray-700"
                  onClick={() => navigate(`/playlists/${userId}`)}
                >
                  Create New Playlist
                </li>
              </ul>
            </div>
          )}
        </div>
        <button
          className="p-1 hover:bg-[#333333] rounded-full"
          onClick={() => handleDownload(station.url, station.name)}
        >
          <Download size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen flex-col bg-black text-white">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 min-h-screen ml-64 bg-black overflow-y-auto">
          <section className="px-6 py-4">
            <h2 className="text-3xl font-bold mb-6">Chillout Radio Stations</h2>
            {loading ? (
              <div className="text-center py-4">Loading stations...</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {stations.map((station, index) => renderStationCard(station, index))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}