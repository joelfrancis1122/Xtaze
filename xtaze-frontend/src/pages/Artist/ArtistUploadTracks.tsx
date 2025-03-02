import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import ArtistSidebar from "./artistComponents/artist-aside";
import { Input } from "../../components/ui/input";
import { toast } from "sonner";
import axios from "axios";
import { Label } from "../../components/ui/label";
import { Select } from "../../components/ui/select";
import { cn } from "../../../lib/utils";
import { RootState } from "../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { saveArtistData } from "../../redux/artistSlice";

const UploadMusicPage = () => {
    const artist = useSelector((state: RootState) => state.artist.signupData);
    const dispatch = useDispatch()
    const [songData, setSongData] = useState({
        songName: "",
        artist: "",
        genre: "",
        album: "",
        image: null as File | null,
        song: null as File | null,
    });

    const [isUploading, setIsUploading] = useState(false); // Track upload state
    const [genres, setGenres] = useState<IGenre[]>([]);

    interface IGenre {
        _id: string;
        name: string;
        isBlocked: boolean;
        createdAt: string;
        __v: number;
    }


  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setSongData((prevData) => ({
            ...prevData,
            [e.target.name]: e.target.value,
        }));
    };

   
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSongData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.files?.[0], 
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsUploading(true); // Set uploading state

        // Create FormData instance
        const formData = new FormData();
        formData.append("songName", songData.songName);
        formData.append("artist", songData.artist);
        formData.append("genre", songData.genre);
        formData.append("album", songData.album);
        if (songData.image) formData.append("image", songData.image);
        if (songData.song) formData.append("file", songData.song);
      
        try {
            const response = await axios.post(`http://localhost:3000/artist/upload`, formData, {
                headers: {
                     "Content-Type": "multipart/form-data",
                     "Authorization": `Bearer ${token}`
                 },
            });

            toast.success("Song uploaded successfully! 🎶");
            console.log("Song uploaded successfully:", response.data);

            // Reset form after upload
            setSongData({
                songName: "",
                artist: "",
                genre: "",
                album: "",
                image: null,
                song: null,
            });
        } catch (error) {
            toast.error("Error uploading song. Please try again.");
            console.error("Error uploading song:", error);
        } finally {
            setIsUploading(false); // Reset uploading state
        }
    };
console.log(artist,"itheee")
const token = localStorage.getItem("artistToken"); 
    useEffect(() => {
        // Fetch genres from the backendmap
        const fetchGenres = async () => {
            try {

                const response = await axios.get(`http://localhost:3000/artist/listActiveGenres?artistId=${artist?._id}`,{
                    headers:{
                        "Content-Type":"application/json",
                        Authorization:`Bearer ${token}`
                    }
                }); // API endpoint for genres
                dispatch(saveArtistData(response.data.artist))
                setGenres(response.data.data);
                console.log(response.data,"ooooodia")
            } catch (error) {
                toast.error("Error fetching genres. Please try again.");
                console.error("Error fetching genres:", error);
            }
        };

        fetchGenres(); // Call the function to fetch genres
    }, []);
    return (
        <div className="min-h-screen bg-black text-white">
            <div className="grid lg:grid-cols-[280px_2fr] ">
                {/* Sidebar Component */}
                <ArtistSidebar />

                <main className="flex-1 pl-0.4 pr-6 pt-5 pb-6 bg-var(--background)" >
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold mb-4">Upload New Song</h2>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <Label htmlFor="SongName">SongName</Label>

                            <Input
                                type="text"
                                name="songName"
                                placeholder="Song Name"
                                value={songData.songName}
                                onChange={handleChange}
                                required
                            />
                            <Label htmlFor="Artist">Artist</Label>
                            <Input
                                type="text"
                                name="artist"
                                placeholder="Artist"
                                value={songData.artist}
                                onChange={handleChange}
                                required
                            />
                            <LabelInputContainer>
                                <Label htmlFor="Genre">Genre</Label>
                                <select
                                    id="genre"
                                    name="genre"
                                    value={songData.genre}
                                    onChange={handleChange}
                                    required
                                    className="bg-gray-800 text-white border border-gray-700 rounded-lg p-2"
                                >
                                    <option value="" disabled selected className="text-[#27272A]">
                                        Select Genre
                                    </option>
                                    {genres.map((genre, index) => (
                                        <option key={index} value={genre.name} className="text-white">
                                            {genre.name}
                                        </option>
                                    ))}
                                </select>

                            </LabelInputContainer>
                            <Label htmlFor="Album">Album</Label>

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
                            <Label htmlFor="file">Choose File</Label>

                            <Input
                                type="file"
                                name="song"
                                accept="audio/*"
                                onChange={handleFileChange}
                                required
                            />
                            <Button className="w-full" type="submit" disabled={isUploading}>
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
