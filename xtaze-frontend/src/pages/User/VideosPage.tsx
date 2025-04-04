"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./userComponents/SideBar";
import { Plus } from "lucide-react";
import { getMyplaylist } from "../../services/userService";
import { toast } from "sonner";

const API_KEY = import.meta.env.VITE_YOUTUBE_API;


interface Video {
  id: string;
  title: string;
  artist: string;
  videoUrl: string;
  thumbnail: string;
}

// interface Playlist {
//   _id: number | string;
//   title: string;
//   description: string;
//   imageUrl: string;
//   createdBy: string;
//   tracks?: string[];
// }

export default function VideoPage() {
  const [trendingVideos, setTrendingVideos] = useState<Video[]>([]);
  const [newReleases, setNewReleases] = useState<Video[]>([]);
  const [playlistHits, setPlaylistHits] = useState<Video[]>([]);
  const [rockVideos, setRockVideos] = useState<Video[]>([]);
  const [popVideos, setPopVideos] = useState<Video[]>([]);
  const [hipHopVideos, setHipHopVideos] = useState<Video[]>([]);
  const [jazzVideos, setJazzVideos] = useState<Video[]>([]);
  const [highViewsVideos, setHighViewsVideos] = useState<Video[]>([]);
  // const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [dropdownVideoId, setDropdownVideoId] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const navigate = useNavigate();

  const userId = "mockUserId"; // Replace with useSelector
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAllVideosAndPlaylists = async () => {
      if (!token) {
        console.error("No token found. Please login.");
        setLoading(false);
        return;
      }

      const baseParams = {
        part: "snippet",
        chart: "mostPopular",
        videoCategoryId: "10",
        maxResults: 8,
        key: API_KEY,
      };

      try {
        // 1. Trending Music (US)
        const trendingResponse = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
          params: { ...baseParams, regionCode: "US", maxResults: 30 },
        });
        setTrendingVideos(
          trendingResponse.data.items.map((item: any) => ({
            id: item.id,
            title: item.snippet.title,
            artist: item.snippet.channelTitle,
            videoUrl: `https://www.youtube.com/embed/${item.id}?autoplay=1&mute=1`, // Muted by default
            thumbnail: item.snippet.thumbnails.high.url,
          }))
        );

        // 2. New Releases (UK)
        const newReleasesResponse = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
          params: { ...baseParams, regionCode: "GB" },
        });
        setNewReleases(
          newReleasesResponse.data.items.map((item: any) => ({
            id: item.id,
            title: item.snippet.title,
            artist: item.snippet.channelTitle,
            videoUrl: `https://www.youtube.com/embed/${item.id}?autoplay=1&mute=1`,
            thumbnail: item.snippet.thumbnails.high.url,
          }))
        );

        // 3. Top Playlist Hits (Germany)
        const playlistResponse = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
          params: { ...baseParams, regionCode: "DE" },
        });
        setPlaylistHits(
          playlistResponse.data.items.map((item: any) => ({
            id: item.id,
            title: item.snippet.title,
            artist: item.snippet.channelTitle,
            videoUrl: `https://www.youtube.com/embed/${item.id}?autoplay=1&mute=1`,
            thumbnail: item.snippet.thumbnails.high.url,
          }))
        );

        // 4. Rock Vibes (France)
        const rockResponse = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
          params: { ...baseParams, regionCode: "FR" },
        });
        setRockVideos(
          rockResponse.data.items.map((item: any) => ({
            id: item.id,
            title: item.snippet.title,
            artist: item.snippet.channelTitle,
            videoUrl: `https://www.youtube.com/embed/${item.id}?autoplay=1&mute=1`,
            thumbnail: item.snippet.thumbnails.high.url,
          }))
        );

        // 5. Pop Hits (Spain)
        const popResponse = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
          params: { ...baseParams, regionCode: "ES" },
        });
        setPopVideos(
          popResponse.data.items.map((item: any) => ({
            id: item.id,
            title: item.snippet.title,
            artist: item.snippet.channelTitle,
            videoUrl: `https://www.youtube.com/embed/${item.id}?autoplay=1&mute=1`,
            thumbnail: item.snippet.thumbnails.high.url,
          }))
        );

        // 6. Hip Hop Beats (Italy)
        const hipHopResponse = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
          params: { ...baseParams, regionCode: "IT" },
        });
        setHipHopVideos(
          hipHopResponse.data.items.map((item: any) => ({
            id: item.id,
            title: item.snippet.title,
            artist: item.snippet.channelTitle,
            videoUrl: `https://www.youtube.com/embed/${item.id}?autoplay=1&mute=1`,
            thumbnail: item.snippet.thumbnails.high.url,
          }))
        );

        // 7. Jazz Classics (Canada)
        const jazzResponse = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
          params: { ...baseParams, regionCode: "CA" },
        });
        setJazzVideos(
          jazzResponse.data.items.map((item: any) => ({
            id: item.id,
            title: item.snippet.title,
            artist: item.snippet.channelTitle,
            videoUrl: `https://www.youtube.com/embed/${item.id}?autoplay=1&mute=1`,
            thumbnail: item.snippet.thumbnails.high.url,
          }))
        );

        // 8. High Views (Australia)
        const highViewsResponse = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
          params: { ...baseParams, regionCode: "AU" },
        });
        setHighViewsVideos(
          highViewsResponse.data.items.map((item: any) => ({
            id: item.id,
            title: item.snippet.title,
            artist: item.snippet.channelTitle,
            videoUrl: `https://www.youtube.com/embed/${item.id}?autoplay=1&mute=1`,
            thumbnail: item.snippet.thumbnails.high.url,
          }))
        );

         await getMyplaylist(userId);
        // setPlaylists(fetchedPlaylists);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load videos or playlists");
      } finally {
        setLoading(false);
      }
    };

    fetchAllVideosAndPlaylists();
  }, [userId, token]);

  


  const handlePlayVideo = (videoId: string) => {
    // Toggle off if same video, otherwise play new one
    setSelectedVideo(selectedVideo === videoId ? null : videoId);
  };



  const renderVideoSection = (title: string, videos: Video[]) => (
    <div className="mb-8">
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      {loading && videos.length === 0 ? (
        <div className="text-center py-4">Loading {title.toLowerCase()}...</div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-3 xl::grid-cols-4 gap-6">
          {videos.map((video) => (
            <div
              key={`${video.id}-${Date.now()}`} // Unique key to force re-render
              className="group bg-[#1d1d1d] rounded-lg p-4 hover:bg-[#242424] transition-colors flex flex-col"
            >
              <div className="w-full h-[180px] mb-3 relative aspect-[16/9]">
                {selectedVideo === video.id ? (
                  <iframe
                    key={video.id} // Unique key for iframe to ensure unmount
                    src={video.videoUrl}
                    className="w-full h-full rounded-md"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title={video.title}
                  />
                ) : (
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover rounded-md cursor-pointer"
                    onClick={() => handlePlayVideo(video.id)}
                  />
                )}
              </div>
              <div className="flex flex-col flex-1">
                <div className="text-white font-semibold truncate">{video.title}</div>
                <div className="text-gray-400 text-sm truncate mb-2">{video.artist}</div>
                <div className="flex gap-2 mt-auto opacity-0 group-hover:opacity-100 transition-opacity relative">
                  <div className="relative">
                    <button
                      className="p-1 hover:bg-[#333333] rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDropdownVideoId(dropdownVideoId === video.id ? null : video.id);
                      }}
                    >
                      <Plus size={16} />
                    </button>
                    {dropdownVideoId === video.id && (
                      <div className="absolute left-0 mt-2 w-48 bg-[#242424] rounded-md shadow-lg z-20">
                        <ul className="py-1">
                          {/* {playlists.length > 0 ? (
                            playlists.map((playlist) => (
                              <li
                                key={playlist._id}
                                className="px-4 py-2 hover:bg-[#333333] cursor-pointer text-white"
                                onClick={() => handleAddToPlaylist(video.id, playlist._id.toString())}
                              >
                                {playlist.title}
                              </li>
                            ))
                          ) : (
                            <li className="px-4 py-2 text-gray-400">No playlists available</li>
                          )} */}
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
               
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen flex-col bg-black text-white">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 min-h-screen ml-64 bg-black overflow-y-auto">
          <section className="px-6 py-4">
            <h2 className="text-3xl font-bold mb-6">Music Videos</h2>
            {renderVideoSection("Trending Music (US)", trendingVideos)}
            {renderVideoSection("New Releases (UK)", newReleases)}
            {renderVideoSection("Top Playlist Hits (Germany)", playlistHits)}
            {renderVideoSection("Rock Vibes (France)", rockVideos)}
            {renderVideoSection("Pop Hits (Spain)", popVideos)}
            {renderVideoSection("Hip Hop Beats (Italy)", hipHopVideos)}
            {renderVideoSection("Jazz Classics (Canada)", jazzVideos)}
            {renderVideoSection("High Views (Australia)", highViewsVideos)}
          </section>
        </main>
      </div>
    </div>
  );
}