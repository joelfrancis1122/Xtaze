"use client";

import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../store/store";
import axios from "axios";
import { toast } from "sonner";
import Cropper, { Area } from "react-easy-crop";
import { Camera, Power } from "lucide-react";
import ProfilePage from "../../assets/profile6.jpeg";
import ArtistSidebar from "./artistComponents/artist-aside";
import { clearArtistData, saveArtistData } from "../../redux/artistSlice";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";

// Define the Track type based on your expected API response
interface Track {
    _id: string;
    title: string;
    releaseDate: string;
    listeners: number;
}

export default function ArtistProfile() {
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const user = useSelector((state: RootState) => state.artist.signupData);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [coverMediaSrc, setCoverMediaSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState<number>(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [croppedImage, setCroppedImage] = useState<string | undefined>(undefined);
    const [croppedCoverMedia, setCroppedCoverMedia] = useState<string | undefined>(undefined);
    const [showCropper, setShowCropper] = useState<"profile" | "cover" | null>(null);
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [bioText, setBioText] = useState<string>(String(user?.bio || ""));
    const [tracks, setTracks] = useState<Track[]>([]); // State to store fetched tracks

    const token = localStorage.getItem("artistToken");
    useEffect(() => {
        if (!token) {
            console.error("No token found. Please login.");
            navigate("/login");
            return;
        }

        const fetchTracks = async () => {
            if (!user?._id) return;

            try {
                const response = await axios.get(`${baseUrl}/artist/getAllTracksArtist?userId=${user._id}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`, 
                    },
                });
                const data = await response.data;
                if (data.success && Array.isArray(data.tracks)) {
                    setTracks(data.tracks); 
                } else {
                    console.error("Failed to fetch tracks:", data.message);
                    setTracks([]);
                }
            } catch (error) {
                console.error("Error fetching tracks:", error);
                setTracks([]);
            }
        };

        fetchTracks();
    }, [navigate, user?._id]);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>, type: "profile" | "cover") => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const dataUrl = reader.result as string;
            if (type === "profile") {
                setImageSrc(dataUrl);
                setShowCropper("profile");
            } else {
                setCoverMediaSrc(dataUrl);
                if (file.type.startsWith("video/")) {
                    uploadCroppedMedia(dataUrl, "coverImage");
                } else {
                    setShowCropper("cover");
                }
            }
        };
    };

    const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const getCroppedImage = async (): Promise<string | null> => {
        if (!imageSrc && !coverMediaSrc) return null;

        return new Promise<string | null>((resolve) => {
            const image = new Image();
            image.src = (showCropper === "profile" ? imageSrc : coverMediaSrc) as string;
            image.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                if (!ctx || !croppedAreaPixels) return resolve(null);

                canvas.width = croppedAreaPixels.width;
                canvas.height = croppedAreaPixels.height;

                ctx.drawImage(
                    image,
                    croppedAreaPixels.x,
                    croppedAreaPixels.y,
                    croppedAreaPixels.width,
                    croppedAreaPixels.height,
                    0,
                    0,
                    croppedAreaPixels.width,
                    croppedAreaPixels.height
                );

                resolve(canvas.toDataURL("image/jpeg"));
            };
        });
    };

    const handleCropConfirm = async () => {
        const cropped = await getCroppedImage();
        if (cropped) {
            if (showCropper === "profile") {
                setCroppedImage(cropped);
                uploadCroppedMedia(cropped, "profileImage");
            } else {
                setCroppedCoverMedia(cropped);
                uploadCroppedMedia(cropped, "coverImage");
            }
            setShowCropper(null);
        }
    };

    const uploadCroppedMedia = async (mediaData: string, field: "profileImage" | "coverImage") => {
        const blob = await (await fetch(mediaData)).blob();
        const formData = new FormData();
        formData.append(field, blob, `artist-${field}.${field === "profileImage" ? "jpg" : blob.type.startsWith("video/") ? "mp4" : "jpg"}`);

        if (user?._id) {
            formData.append("userId", user._id);
        } else {
            toast.error("User ID not found.");
            return;
        }

        try {
            const route = field === "profileImage" ? "/user/uploadProfilepic" : "/user/updateBanner";
            const response = await axios.post<{
                success: boolean;
                message: string;
                user?: any;
            }>(
                `${baseUrl}${route}`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" ,
                Authorization: `Bearer ${token}`,

                } }
            );
            console.log("Upload response:", response.data);

            if (response.data.success && response.data.user) {
                dispatch(saveArtistData(response.data.user));
                setCroppedCoverMedia(response.data.user.banner);
                toast.success(`${field === "profileImage" ? "Profile picture" : "Banner"} updated!`);
            } else {
                toast.error(`Failed to update ${field === "profileImage" ? "profile picture" : "banner"}: ${response.data.message}`);
            }
        } catch (error) {
            console.error(`Error uploading ${field}:`, error);
            toast.error("Something went wrong. Please try again.");
        }
    };

    const handleBioSave = async () => {
        if (!bioText.trim()) {
            toast.error("Bio cannot be empty.");
            return;
        }

        try {

            const response = await axios.put<{ success: boolean; user?: any }>(
                `${baseUrl}/user/updateBio`,
                { userId: user?._id, bio: bioText },
                { headers: { "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,

                 } }
            );

            if (response.data.success && response.data.user) {
                dispatch(saveArtistData(response.data.user));
                setIsEditingBio(false);
                toast.success("Bio updated successfully!");
            } else {
                toast.error("Failed to update bio.");
            }
        } catch (error) {
            console.error("Error updating bio:", error);
            toast.error("Something went wrong. Please try again.");
        }
    };


    return (
        <div className="min-h-screen bg-black text-white">
            {showCropper && (
                <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
                    <Card className="p-6 bg-black border border-white">
                        <h2 className="text-lg font-semibold text-white mb-4">
                            Crop Your {showCropper === "profile" ? "Profile" : "Banner"} Image
                        </h2>
                        <div className="relative w-[400px] h-[400px] bg-black border border-white">
                            <Cropper
                                image={(showCropper === "profile" ? imageSrc : coverMediaSrc) as string}
                                crop={crop}
                                zoom={zoom}
                                aspect={showCropper === "profile" ? 1 : 16 / 9}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        </div>
                        <div className="flex justify-end mt-6 gap-2">
                            <Button className="bg-black text-white border border-white" onClick={() => setShowCropper(null)}>
                                Cancel
                            </Button>
                            <Button className="bg-black text-white border border-white" onClick={handleCropConfirm}>
                                Crop & Upload
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            <div className="grid lg:grid-cols-[280px_1fr]">
                <ArtistSidebar />
                <main className="flex-1 pl-0.4 pr-6 pt-5 pb-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold text-white">Artist Profile</h1>
                            <div className="text-sm text-white">Your artist details</div>
                        </div>
                      
                    </div>

                    <div className="space-y-6">
                        {/* Cover Banner with Profile Picture */}
                        <Card className="bg-black border border-white">
                            <div className="relative w-full h-66">
                                {(croppedCoverMedia?.endsWith(".mp4") || user?.banner?.endsWith(".mp4")) ? (
                                    <video
                                        src={croppedCoverMedia as string ?? user?.banner}
                                        autoPlay
                                        loop
                                        muted
                                        className="w-full h-full object-cover"
                                        style={{ maxHeight: "100%" }}
                                    />
                                ) : (
                                    <img
                                        src={croppedCoverMedia as string ?? user?.banner ?? ProfilePage}
                                        alt="Cover Banner"
                                        className="w-full h-full object-cover"
                                    />
                                )}
                                <label
                                    htmlFor="cover-upload"
                                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 opacity-0 hover:opacity-100 cursor-pointer"
                                >
                                    <Camera size={28} className="text-white" />
                                </label>
                                <input
                                    type="file"
                                    id="cover-upload"
                                    accept="image/*,video/*"
                                    className="hidden"
                                    onChange={(e) => handleImageChange(e, "cover")}
                                />
                                <div className="absolute bottom-0 left-6 transform translate-y-1/2">
                                    <div className="relative w-32 h-32">
                                        <img
                                            src={(croppedImage as string) ?? (user?.profilePic as string) ?? ProfilePage}
                                            alt="Artist Profile"
                                            className="w-32 h-32 rounded-full object-cover border-4 border-black bg-black"
                                        />
                                        <label
                                            htmlFor="profile-upload"
                                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-full opacity-0 hover:opacity-100 cursor-pointer"
                                        >
                                            <Camera size={28} className="text-white" />
                                        </label>
                                        <input
                                            type="file"
                                            id="profile-upload"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleImageChange(e, "profile")}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="pt-20 px-6 pb-6">
                                <h2 className="text-xl font-semibold text-white">{user?.username}</h2>
                                <p className="text-white">{user?.email}</p>
                                <p className="text-white">{user?.gender || "Genre not specified"}</p>
                            </div>
                        </Card>

                        {/* Artist Bio */}
                        <Card className="p-6 bg-black border border-white w-full">
                            <h2 className="text-lg font-semibold text-white mb-4">About the Artist</h2>
                            {isEditingBio ? (
                                <div className="max-w-full">
                                    <textarea
                                        value={bioText}
                                        onChange={(e) => setBioText(e.target.value)}
                                        className="w-full h-32 p-2 bg-black text-white border border-white rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-white break-words whitespace-pre-wrap"
                                        placeholder="Enter your bio here..."
                                        maxLength={300}
                                    />
                                    <div className="flex gap-2">
                                        <Button className="bg-black text-white border border-white" onClick={() => setIsEditingBio(false)}>
                                            Cancel
                                        </Button>
                                        <Button className="bg-black text-white border border-white" onClick={handleBioSave}>
                                            Save
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-white min-h-[120px] break-words whitespace-pre-wrap">
                                        {user?.bio || "Craft your story here. Share your journey, inspirations, and what drives your music. This space is for a detailed bio to let your fans know more about you, your influences, and your artistic path."}
                                    </p>
                                    <Button
                                        className="mt-4 bg-black text-white border border-white"
                                        onClick={() => setIsEditingBio(true)}
                                    >
                                        Edit Bio
                                    </Button>
                                </div>
                            )}
                        </Card>

                        {/* Artist Releases */}
                        <Card className="p-6 bg-black border border-white">
                            <h2 className="text-lg font-semibold text-white mb-4">Releases</h2>
                            <div className="space-y-4">
                                {tracks.length > 0 ? (
                                    tracks.map((track) => (
                                        <div key={track._id} className="bg-black p-4 border border-white">
                                            <p className="text-white font-semibold">{track.title}</p>
                                            <p className="text-white text-sm">
                                                 Listeners: {track.listeners.toLocaleString()}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-white">No tracks available.</p>
                                )}
                            </div>
                        </Card>

                        {/* Social Media & Stats */}
                        <Card className="p-6 bg-black border border-white">
                            <h2 className="text-lg font-semibold text-white mb-4">Connect & Stats</h2>
                            <div className="flex justify-between items-center">
                                <div className="flex gap-6">
                                    <a href="#" className="text-white">Twitter</a>
                                    <a href="#" className="text-white">Instagram</a>
                                    <a href="#" className="text-white">Spotify</a>
                                </div>
                                <div className="text-white">
                                    <p>Fans: <span className="font-semibold">12.5K</span></p>
                                    <p>Total Streams: <span className="font-semibold">3.8M</span></p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}