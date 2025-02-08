import { Request, Response } from 'express';
import axios from 'axios';

const DEEZER_PLAYLIST_API = 'https://api.deezer.com/playlist/1313621735/tracks';
const LIMIT = 100; // Number of tracks to fetch

interface DeezerTrack {
  id: number;
  title: string;
  artist: {
    name: string;
  };
  album: {
    cover_medium: string;
  };  
  preview: string | null;
}

interface DeezerPlaylistResponse {
  data: DeezerTrack[];
  total: number;
  next?: string;
}

export const getDeezerSongs = async (req: Request, res: Response): Promise<void> => {
  try {
    const allSongs: DeezerTrack[] = [];
    let currentUrl = `${DEEZER_PLAYLIST_API}?limit=${LIMIT}`;

    // Keep fetching until we have 100 songs or there are no more songs
    while (allSongs.length < LIMIT && currentUrl) {
      const response = await axios.get<DeezerPlaylistResponse>(currentUrl);
      allSongs.push(...response.data.data);
      currentUrl = response.data.next || '';
    }

    // Take only the first 100 songs
    const songs = allSongs.slice(0, LIMIT).map((track: DeezerTrack) => ({
      title: track.title,
      artist: track.artist.name,
      fileUrl: track.preview,
      img: track.album.cover_medium,
    }));

    if (songs.length === 0) {
      res.status(404).json({ error: 'No songs found with previews' });
    } else {
      res.json({ songs });
    }
  } catch (error: any) {
    console.error('Error fetching Deezer songs:', error.message);
    res.status(500).json({
      error: 'Failed to fetch songs from Deezer',
      details: error.message,
    });
  }
};
