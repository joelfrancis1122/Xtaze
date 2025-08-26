
import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Play, Pause, Edit2, Save, X, ChevronDown } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "../../components/ui/table";
import ArtistSidebar from "./artistComponents/artist-aside";
import { toast } from "sonner";
import { IGenre } from "../User/types/IGenre";
import { IAlbum } from "../User/types/IAlbums";
import { fetchActiveGenres, fetchAlbums, fetchArtistTracks, updateTrackByArtist } from "../../services/artistService";
import { saveArtistData } from "../../redux/artistSlice";
import { useDispatch } from "react-redux";

interface Song {
  id: string;
  title: string;
  fileUrl: string;
  listeners: string[];
  genre?: string[];
  albumId?: string;
  img?: string;
  artists?: string[];
}


export function ArtistSongUpdatePage() {
  const [topSongs, setTopSongs] = useState<Song[]>([]);
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const [editingSongId, setEditingSongId] = useState<string | null>(null);
  const [editedSong, setEditedSong] = useState<Partial<Song>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const user = useSelector((state: RootState) => state.artist.signupData);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  // Inject CSS for dark theme
  useEffect(() => {
    const styles = `
      body, * {
        background-color: var(--background) !important; /* Dark background */
      }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet); 
    };
  }, []);

  // Fetch songs on mount
  useEffect(() => {
  const fetchSongs = async () => {
    if (!token || !user?.id) {
      toast.error("Please log in to fetch tracks.");
      return;
    }
    try {
      const response = await fetchArtistTracks(user.id, page, limit);
      console.log(response,"ssss")
      if (Array.isArray(response.data)) {
        setTopSongs(response.data);
        setTotalPages(response.pagination.totalPages);
      } else {
        setTopSongs([]);
        toast.error("No tracks found.");
      }
    } catch (error: any) {
      console.error("Error fetching tracks:", error);
      toast.error(error.message || "Error fetching tracks.");
      setTopSongs([]);
    }
  };

  fetchSongs();
}, [user?.id, page, limit]);

  // Play/Pause functionality
  const handlePlayPause = (song: Song) => {
    if (!audioRef.current) {
      audioRef.current = new Audio(song.fileUrl);
    }
    console.log(playingSongId,song,"asiasidiasidasidis")
    if (playingSongId === song.id) {
      audioRef.current.pause();
      setPlayingSongId(null);
    } else {
      if (playingSongId !== null && audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      audioRef.current.src = song.fileUrl;
      audioRef.current.play().catch((error) => console.error("Error playing audio:", error));
      setPlayingSongId(song.id);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Start editing a song
  const startEditing = (song: Song) => {
    setEditingSongId(song.id);
    setEditedSong({
      id: song.id,
      title: song.title,
      artists: song.artists ?? [],
      genre: song.genre ?? [],
      albumId: song.albumId || "",
    });

    setImageFile(null);
    setAudioFile(null);
  };


  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedSong((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image file change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
  };

  // Handle audio file change
  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAudioFile(file);
  };
  const dispatch = useDispatch();

  // Save updated song
  const saveSong = async () => {
    if (!editingSongId || !editedSong.id) return;

    const token = localStorage.getItem("artistToken");
    if (!token) {
      toast.error("No authentication token found. Please login.");
      return;
    }

    try {
      const songData = {
        title: editedSong.title || "",
        artists: Array.isArray(editedSong.artists)
          ? editedSong.artists
          : (editedSong.artists
            ? String(editedSong.artists).split(",").map(a => a.trim())
            : []),
        genre: Array.isArray(editedSong.genre)
          ? editedSong.genre
          : (editedSong.genre ? String(editedSong.genre).split(",").map(g => g.trim()) : []),
        albumId: editedSong.albumId || "",
        img: imageFile || undefined,
        fileUrl: audioFile || undefined,
      };

      const updatedTrack = await updateTrackByArtist(editingSongId, songData);

      setTopSongs((prev) =>
        prev.map((song) =>
          song.id === editingSongId ? { ...song, ...updatedTrack } : song
        )
      );

      setEditingSongId(null);
      setEditedSong({});
      setImageFile(null);
      setAudioFile(null);
      toast.success("Song updated successfully!");
    } catch (error: any) {
      console.error("Error updating song:", error);
      toast.error(error?.message || "An error occurred while updating the song.");
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingSongId(null);
    setEditedSong({});
    setImageFile(null);
    setAudioFile(null);
  };
  const artist = useSelector((state: RootState) => state.artist.signupData);
  const token = localStorage.getItem("artistToken");

  const [genres, setGenres] = useState<IGenre[]>([]);
  const [albums, setAlbums] = useState<IAlbum[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      console.log("tooororo", artist)
      if (!token || !artist?.id) {
        toast.error("Please log in to fetch genres and albums.");
        return;
      }

      try {
        const [genreResponse, albumResponse] = await Promise.all([
          fetchActiveGenres(artist.id),
          fetchAlbums(artist.id),
        ]);

        setGenres(genreResponse.genres);
        setAlbums(albumResponse);
        console.log(genreResponse,albumResponse,"adi adi ad iad i")
        dispatch(saveArtistData(genreResponse.artist));
      } catch (error: any) {
        toast.error(error.message || "Error fetching data. Please try again.");
      }
    };

    fetchData();
  }, [artist?.id, token, dispatch]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="grid lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <ArtistSidebar />

        {/* Main Content */}
        <main className="flex-1 pl-0.5 pr-4 md:pr-6 pt-5 pb-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-xl md:text-2xl font-bold">Manage Songs</h1>
              <div className="text-xs md:text-sm text-muted-foreground">Update your tracks here</div>
            </div>
            <Button variant="outline" className="gap-2 text-xs md:text-sm">
              Filter
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          <Card className="p-4 md:p-6 bg-gray-900">
            <h2 className="text-lg md:text-xl font-semibold mb-4">Your Songs</h2>
            <Table>
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold border-b">##</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold border-b">Title</th>
                  <th className="px-4 py-2 text-center text-sm font-semibold border-b">Plays</th>
                  <th className="px-4 py-2 text-center text-sm font-semibold border-b">Actions</th>
                </tr>
              </thead>
         <TableBody>
  {topSongs && topSongs.length > 0 ? (
    topSongs.map((song) => {
      const isPlaying = playingSongId === song.id;
      return (
        <TableRow key={song.id} className="hover:bg-gray-700">
          <TableCell>
            <button onClick={() => handlePlayPause(song)} className="p-1">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          </TableCell>
          <TableCell className="text-xs md:text-sm font-medium">{song.title}</TableCell>
          <TableCell className="text-xs md:text-sm text-center">
            {(song.listeners?.length || 0).toLocaleString()}
          </TableCell>
          <TableCell className="text-center">
            <button
              onClick={() => startEditing(song)}
              className="p-1 text-blue-400 hover:text-blue-300"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          </TableCell>
        </TableRow>
      );
    })
  ) : (
    <TableRow>
      <TableCell colSpan={4} className="text-center text-xs md:text-sm py-4">
        No tracks available.
      </TableCell>
    </TableRow>
  )}
</TableBody>

            </Table>
          </Card>

          {/* Edit Form (Conditional Rendering) */}
          {editingSongId && (
            <Card className="mt-6 p-4 md:p-6 bg-gray-900">
              <h3 className="text-lg md:text-xl font-semibold mb-4">Edit Song</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={editedSong.title || ""}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1">Image File</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-500"
                  />
                  {imageFile && <p className="text-xs text-gray-400 mt-1">{imageFile.name}</p>}
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1">Audio File</label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioChange}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-500"
                  />
                  {audioFile && <p className="text-xs text-gray-400 mt-1">{audioFile.name}</p>}
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1">Artists (comma-separated)</label>
                  <input
                    type="text"
                    name="artists"
                    value={editedSong.artists || ""}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="genre"
                    className="block text-xs md:text-sm font-medium mb-1"
                  >
                    Genre
                  </label>
                  <select
                    id="genre"
                    name="genre"
                    value={editedSong.genre?.[0] || ""}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    aria-describedby="genre-desc"
                  >
                    <option value="" disabled>
                      Select Genre
                    </option>
                    {genres.map((genre) => (
                      <option key={genre.id} value={genre.name}>
                        {genre.name}
                      </option>
                    ))}
                  </select>
                  <span id="genre-desc" className="text-xs text-gray-400">
                    Select the song genre.
                  </span>
                </div>
                <div>
                  <label
                    htmlFor="albumId"
                    className="block text-xs md:text-sm font-medium mb-1"
                  >
                    Album
                  </label>
                  <select
                    id="albumId"
                    name="albumId"
                    value={editedSong.albumId || ""}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    aria-describedby="albumId-desc"
                  >
                    {/* <option value="">No Album</option> */}
                    {albums.map((album) => (
                      <option key={album.id} value={album.id}>
                        {album.name}
                      </option>
                    ))}
                  </select>

                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  onClick={cancelEditing}
                  className="p-2 bg-blue-600 hover:bg-blue-500 text-xs md:text-sm flex items-center gap-1"
                >
                  <X className="h-4 w-4" /> Cancel
                </Button>
                <Button
                  onClick={saveSong}
                  className="p-2 bg-blue-600 hover:bg-blue-500 text-xs md:text-sm flex items-center gap-1"
                >
                  <Save className="h-4 w-4" /> Save
                </Button>
              </div>
            </Card>
          )}
        <div className="flex justify-between items-center mt-4">
  <Button
    disabled={page === 1}
    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
  >
    Previous
  </Button>

  <span className="text-gray-400">
    Page {page} of {totalPages}
  </span>

  <Button
    disabled={page === totalPages || totalPages === 0}
    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
  >
    Next
  </Button>
</div>
        </main>
      </div>
    </div>
  );
}

export default ArtistSongUpdatePage;