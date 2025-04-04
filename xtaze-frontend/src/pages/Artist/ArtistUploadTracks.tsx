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
import artistService, { IGenre } from "../../services/artistService";

const UploadMusicPage = () => {
  const artist = useSelector((state: RootState) => state.artist.signupData);
  const dispatch = useDispatch();
  const token = localStorage.getItem("artistToken");

  const [songData, setSongData] = useState({
    songName: "",
    artist: artist?.username || "", // Pre-fill with artist's username
    genre: "",
    album: "",
    image: null as File | null,
    song: null as File | null,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [genres, setGenres] = useState<IGenre[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSongData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; 
    if (file) {
      setSongData((prevData) => ({
        ...prevData,
        [e.target.name]: file,
      }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) {
      toast.error("Please log in to upload a song.");
      return;
    }

    setIsUploading(true);

    try {
      await artistService.uploadSong(songData, token);
      toast.success("Song uploaded successfully");

      // Reset form after upload
      setSongData({
        songName: "",
        artist: artist?.username || "",
        genre: "",
        album: "",
        image: null,
        song: null,
      });
    } catch (error: any) {
        console.log("but hwyy")
      toast.error(error.message || "Error uploading song. Please try again.");
      console.error("Error uploading song:", error);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const fetchGenres = async () => {
      if (!token || !artist?._id) {
        toast.error("Please log in to fetch genres.");
        return;
      }

      try {
        const { genres, artist: updatedArtist } = await artistService.fetchActiveGenres(artist._id, token);
        setGenres(genres);
        dispatch(saveArtistData(updatedArtist)); // Update Redux with latest artist data
        console.log("Fetched genres:", genres);
      } catch (error: any) {
        toast.error(error.message || "Error fetching genres. Please try again.");
        console.error("Error fetching genres:", error);
      }
    };

    fetchGenres();
  }, [artist?._id, token, dispatch]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="grid lg:grid-cols-[280px_2fr]">
        {/* Sidebar Component */}
        <ArtistSidebar />

        <main className="flex-1 pl-0.4 pr-6 pt-5 pb-6 bg-var(--background)">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Upload New Song</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Label htmlFor="songName">Song Name</Label>
              <Input
                type="text"
                name="songName"
                placeholder="Song Name"
                value={songData.songName}
                onChange={handleChange}
                required
              />
              <Label htmlFor="artist">Artist</Label>
              <Input
                type="text"
                name="artist"
                placeholder="Artist"
                value={songData.artist}
                onChange={handleChange}
                required
              />
              <LabelInputContainer>
                <Label htmlFor="genre">Genre</Label>
                <select
                  id="genre"
                  name="genre"
                  value={songData.genre}
                  onChange={handleChange}
                  required
                  className="bg-gray-800 text-white border border-gray-700 rounded-lg p-2"
                >
                  <option value="" disabled className="text-[#27272A]">
                    Select Genre
                  </option>
                  {genres.map((genre) => (
                    <option key={genre._id} value={genre.name} className="text-white">
                      {genre.name}
                    </option>
                  ))}
                </select>
              </LabelInputContainer>
              <Label htmlFor="album">Album</Label>
              <Input
                type="text"
                name="album"
                placeholder="Album"
                value={songData.album}
                onChange={handleChange}
              />
              <Label htmlFor="image">Choose Image</Label>
              <Input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleFileChange}
                required
                className="border border-gray-400 rounded-md p-2"
              />
              <Label htmlFor="song">Choose File</Label>
              <Input
                type="file"
                name="song"
                accept="audio/*"
                onChange={handleFileChange}
                required
              />
              <Button className="w-full" type="submit" disabled={isUploading || !token}>
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </form>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default UploadMusicPage;

const LabelInputContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("flex flex-col space-y-2 w-full", className)}>{children}</div>
);