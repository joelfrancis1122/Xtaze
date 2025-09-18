import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import ArtistSidebar from "./artistComponents/artist-aside";
import { Input } from "../../components/ui/input";
import { toast } from "sonner";
import { Label } from "../../components/ui/label";
import { cn } from "../../../lib/utils";
import { RootState } from "../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { saveArtistData } from "../../redux/artistSlice";
import { IGenre } from "../User/types/IGenre";
import { IAlbum } from "../User/types/IAlbums";
import { ChevronDown, ChevronUp } from "lucide-react";
import {useNavigate } from "react-router-dom";
import { createAlbum, fetchActiveGenres, fetchAlbums, uploadSong } from "../../services/artistService";

const UploadMusicPage = () => {
  const artist = useSelector((state: RootState) => state.artist.signupData);
  const dispatch = useDispatch();
  const token = localStorage.getItem("artistToken");
const navigate = useNavigate()
  const [songData, setSongData] = useState({
    songName: "",
    artist: artist?.username || "",
    genre: "",
    albumId: "" as string | "",
    image: null as File | null,
    song: null as File | null,
  });

  const [albumData, setAlbumData] = useState({
    name: "",
    description: "",
    coverImage: null as File | null,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
  const [isAlbumFormOpen, setIsAlbumFormOpen] = useState(false);
  const [genres, setGenres] = useState<IGenre[]>([]);
  const [albums, setAlbums] = useState<IAlbum[]>([]);

  const handleSongChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSongData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSongFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSongData((prevData) => ({
        ...prevData,
        [e.target.name]: file,
      }));
    }
  };

  const handleAlbumChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAlbumData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAlbumFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAlbumData((prevData) => ({
        ...prevData,
        coverImage: file,
      }));
    }
  };

  const handleSongSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) {
      toast.error("Please log in to upload a song.");
      return;
    }
    if (!songData.image || !songData.song) {
      toast.error("Please select both an image and an audio file.");
      return;
    }

    setIsUploading(true);
    try {
      await uploadSong(songData);
      toast.success("Song uploaded successfully");
      setSongData({
        songName: "",
        artist: artist?.username || "",
        genre: "",
        albumId: "",
        image: null,
        song: null,
      });
      (document.getElementById("image") as HTMLInputElement).value = "";
      (document.getElementById("song") as HTMLInputElement).value = "";
    } catch (error: any) {
      toast.error(error.message || "Error uploading song. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAlbumSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token || !artist?.id) {
      toast.error("Please log in to create an album.");
      return;
    }
    if (!albumData.name) {
      toast.error("Album name is required.");
      return;
    }

    setIsCreatingAlbum(true);
    try {
      const newAlbum = await createAlbum({ ...albumData, artistId: artist.id });
      setAlbums((prev) => [...prev, newAlbum]);
      toast.success("Album created successfully");
      setAlbumData({ name: "", description: "", coverImage: null });
      (document.getElementById("coverImage") as HTMLInputElement).value = "";
      setIsAlbumFormOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Error creating album. Please try again.");
    } finally {
      setIsCreatingAlbum(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if ( !artist?.id) {
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
        <ArtistSidebar />
        <main className="flex-1">
          {/* Forms Card */}
          <Card className="p-6 bg-black border-gray-700 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Upload New Song</h2>
              <Button
                variant="outline"
                className="bg-gold-400 text-navy-900 hover:bg-gold-500"
                onClick={() => setIsAlbumFormOpen(!isAlbumFormOpen)}
                aria-expanded={isAlbumFormOpen}
                aria-controls="album-form"
              >
                {isAlbumFormOpen ? (
                  <>
                    Hide Album Form <ChevronUp className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Create New Album <ChevronDown className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            {/* Album Creation Form */}
            <div
              id="album-form"
              className={cn(
                "space-y-4 mb-6 transition-all duration-300 ease-in-out overflow-hidden",
                isAlbumFormOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <h3 className="text-lg font-semibold">Create Album</h3>
              <form className="space-y-4" onSubmit={handleAlbumSubmit}>
                <LabelInputContainer>
                  <Label htmlFor="albumName">Album Name</Label>
                  <Input
                    id="albumName"
                    name="name"
                    placeholder="Album Name"
                    value={albumData.name}
                    onChange={handleAlbumChange}
                    required
                    aria-describedby="albumName-desc"
                    className="w-full"
                  />
                  <span id="albumName-desc" className="text-sm text-gray-400">
                    Enter a unique name for your album.
                  </span>
                </LabelInputContainer>
                <LabelInputContainer>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Album Description"
                    value={albumData.description}
                    onChange={handleAlbumChange}
                    className="bg-gray-800 text-white border border-gray-700 rounded-lg p-2 w-full"
                    rows={4}
                    aria-describedby="description-desc"
                  />
                  <span id="description-desc" className="text-sm text-gray-400">
                    Optional description of the album.
                  </span>
                </LabelInputContainer>
                <LabelInputContainer>
                  <Label htmlFor="coverImage">Cover Image</Label>
                  <Input
                    id="coverImage"
                    name="coverImage"
                    type="file"
                    accept="image/*"
                    onChange={handleAlbumFileChange}
                    className="border border-gray-700 rounded-md p-2 w-full"
                    aria-describedby="coverImage-desc"
                  />
                  <span id="coverImage-desc" className="text-sm text-gray-400">
                    {albumData.coverImage ? albumData.coverImage.name : "Select an image (optional)."}
                  </span>
                </LabelInputContainer>
                <Button
                  type="submit"
                  disabled={isCreatingAlbum || !token}
                  className="w-full bg-gold-400 text-navy-900 hover:bg-gold-500"
                >
                  {isCreatingAlbum ? "Creating..." : "Create Album"}
                </Button>
              </form>
            </div>

            {/* Song Upload Form */}
            <form className="space-y-4" onSubmit={handleSongSubmit}>
              <LabelInputContainer>
                <Label htmlFor="songName">Song Name</Label>
                <Input
                  id="songName"
                  name="songName"
                  placeholder="Song Name"
                  value={songData.songName}
                  onChange={handleSongChange}
                  required
                  aria-describedby="songName-desc"
                  className="w-full"
                />
                <span id="songName-desc" className="text-sm text-gray-400">
                  Enter the name of your song.
                </span>
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="artist">Artist</Label>
                <Input
                  id="artist"
                  name="artist"
                  placeholder="Artist"
                  value={songData.artist}
                  onChange={handleSongChange}
                  required
                  aria-describedby="artist-desc"
                  className="w-full"
                />
                <span id="artist-desc" className="text-sm text-gray-400">
                  Your artist name (pre-filled).
                </span>
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="genre">Genre</Label>
                <select
                  id="genre"
                  name="genre"
                  value={songData.genre}
                  onChange={handleSongChange}
                  required
                  className="bg-gray-800 text-white border border-gray-700 rounded-lg p-2 w-full"
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
                <span id="genre-desc" className="text-sm text-gray-400">
                  Select the genre of your song.
                </span>
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="albumId">Album</Label>
               <select
  id="albumId"
  name="albumId"
  value={songData.albumId}
  onChange={handleSongChange}
  className="bg-gray-800 text-white border border-gray-700 rounded-lg p-2 w-full"
  aria-describedby="albumId-desc"
  required
>
  <option value="" disabled>
    No Album
  </option>
  {albums.map((album) => (
    <option key={album.id} value={album.id}>
      {album.name}
    </option>
  ))}
</select>

                <span id="albumId-desc" className="text-sm text-gray-400">
                  Select an album or create a new one.
                </span>
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="image">Song Image</Label>
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleSongFileChange}
                  required
                  className="border border-gray-700 rounded-md p-2 w-full"
                  aria-describedby="image-desc"
                />
                <span id="image-desc" className="text-sm text-gray-400">
                  {songData.image ? songData.image.name : "Select an image for the song."}
                </span>
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="song">Song File</Label>
                <Input
                  id="song"
                  name="song"
                  type="file"
                  accept="audio/*"
                  onChange={handleSongFileChange}
                  required
                  className="border border-gray-700 rounded-md p-2 w-full"
                  aria-describedby="song-desc"
                />
                <span id="song-desc" className="text-sm text-gray-400">
                  {songData.song ? songData.song.name : "Select an audio file."}
                </span>
              </LabelInputContainer>
              <Button
                type="submit"
                disabled={isUploading || !token}
                className="w-full bg-gold-400 text-navy-900 hover:bg-gold-500"
              >
                {isUploading ? "Uploading..." : "Upload Song"}
              </Button>
            </form>
          </Card>

          {/* Albums List */}
          <Card className="p-6 bg-black border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Your Albums</h2>
            {albums.length === 0 ? (
              <p className="text-gray-400">No albums created yet.</p>
            ) : (
              <div
                role="list"
                aria-label="List of your albums"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in"
              >
                {albums.map((album) => (
                <div
    key={album.id}
    role="button"
    aria-label={`View songs for ${album.name}`}
    className="block cursor-pointer"
    onClick={() => navigate(`/artist/albums/${album.id}`)}
  >
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex flex-col space-y-2 hover:bg-gray-700 transition-colors duration-200">
      <div className="w-full h-32 bg-gray-700 rounded-md overflow-hidden">
        {album.coverImage ? (
          <img
            src={album.coverImage}
            alt={`${album.name} cover`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Cover
          </div>
        )}
      </div>
      <h3 className="text-lg font-medium">{album.name}</h3>
      <p className="text-sm text-gray-400 line-clamp-2">
        {album.description || "No description"}
      </p>
    </div>
  </div>
                ))}
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
};

const LabelInputContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("flex flex-col space-y-2 w-full", className)}>{children}</div>
);

export default UploadMusicPage;