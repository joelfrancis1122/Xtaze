import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../store/store";
import axios from "axios";
import { toast } from "sonner";
import Cropper, { Area } from "react-easy-crop";
import { Camera, Power, Search, Music, Star } from "lucide-react";
import ProfilePage from "../../assets/profile6.jpeg";
import ArtistSidebar from "./artistComponents/artist-aside";
import { clearArtistData, saveArtistData } from "../../redux/artistSlice";
import { motion } from "framer-motion";

export default function ArtistProfile() {
    const user = useSelector((state: RootState) => state.artist.signupData);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState<number>(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [croppedImage, setCroppedImage] = useState<string | undefined>(undefined);
    const [showCropper, setShowCropper] = useState<boolean>(false);

    useEffect(() => {
        const token = localStorage.getItem("artistToken");
        if (!token) {
            console.error("No token found. Please login.");
            navigate("/login");
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("artistToken");
        dispatch(clearArtistData());
        navigate("/", { replace: true });
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setImageSrc(reader.result as string);
            setShowCropper(true);
        };
    };

    const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const getCroppedImage = async (): Promise<string | null> => {
        if (!imageSrc || !croppedAreaPixels) return null;

        return new Promise<string | null>((resolve) => {
            const image = new Image();
            image.src = imageSrc;
            image.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                if (!ctx) return resolve(null);

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
            setCroppedImage(cropped);
            setShowCropper(false);
            uploadCroppedImage(cropped);
        }
    };

    const uploadCroppedImage = async (base64Image: string) => {
        const blob = await (await fetch(base64Image)).blob();
        const formData = new FormData();
        formData.append("profileImage", blob, "cropped-image.jpg");

        if (user?._id) {
            formData.append("userId", user._id);
        } else {
            toast.error("User ID not found.");
            return;
        }

        try {
            const response = await axios.post<{ success: boolean; user?: any }>(
                "http://localhost:3000/user/uploadProfilepic",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (response.data.success && response.data.user) {
                dispatch(saveArtistData(response.data.user));
                toast.success("Profile picture updated!");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-b from-black to-gray-900 text-white overflow-hidden">
            {/* Dynamic Background */}
            

            {showCropper && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md flex items-center justify-center z-50"
                >
                    <div className="bg-gray-900 p-6 rounded-xl shadow-2xl border border-gray-800">
                        <h2 className="text-white text-xl font-bold mb-4">Crop Your Image</h2>
                        <div className="relative w-[400px] h-[400px] bg-gray-800 rounded-lg overflow-hidden">
                            <Cropper
                                image={imageSrc!}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        </div>
                        <div className="flex justify-end mt-6 gap-3">
                            <button className="px-5 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition" onClick={() => setShowCropper(false)}>
                                Cancel
                            </button>
                            <button className="px-5 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition" onClick={handleCropConfirm}>
                                Crop & Upload
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="flex flex-1 relative z-10">
                <ArtistSidebar />
                <main className="flex-1 pl-5 pr-6 pt-5 pb-6">
                <header className="flex justify-between items-center mb-8">
                       
                    </header>

                    <section className="space-y-10">
                        {/* Profile Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="flex items-center gap-8"
                        >
                            <div className="relative w-40 h-40 group">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-md opacity-50 group-hover:opacity-0 transition z-0"></div>
                                <img
                                    src={(croppedImage as string) ?? user?.profilePic as string ?? ProfilePage}
                                    alt="Artist Profile"
                                    className="w-40 h-40 rounded-full object-cover relative z-10 border-4 border-gray-900"
                                />
                                <label
                                    htmlFor="profile-upload"
                                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer z-20"
                                >
                                    <Camera size={28} className="text-white" />
                                </label>
                                <input type="file" id="profile-upload" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </div>
                            <div>
                                <h2 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                    {user?.username} <span className="text-yellow-400"><Star size={20} className="inline" /></span>
                                </h2>
                                <p className="text-gray-400 text-lg">{user?.email}</p>
                                <p className="text-gray-300 mt-2 font-semibold">Premium Artist | {user?.gender || "Genre not specified"}</p>
                            </div>
                        </motion.div>

                        {/* Artist Bio */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-800"
                        >
                            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">About the Artist</h3>
                            <p className="text-gray-300 leading-relaxed">
                                {user?.gender || "Craft your story here. Share your journey, inspirations, and what drives your music."}
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                className="mt-6 bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-2 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition"
                            >
                                Edit Bio
                            </motion.button>
                        </motion.div>

                        {/* Artist Releases */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-800"
                        >
                            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Premium Releases</h3>
                            <div className="space-y-6">
                                <motion.div whileHover={{ x: 10 }} className="flex items-center gap-4 bg-gray-800 p-4 rounded-lg">
                                    <Music size={28} className="text-purple-400" />
                                    <div>
                                        <p className="text-white font-semibold text-lg">Song Title 1</p>
                                        <p className="text-gray-400 text-sm">Release Date: Feb 10, 2025 | Streams: 1.2M</p>
                                    </div>
                                </motion.div>
                                <motion.div whileHover={{ x: 10 }} className="flex items-center gap-4 bg-gray-800 p-4 rounded-lg">
                                    <Music size={28} className="text-purple-400" />
                                    <div>
                                        <p className="text-white font-semibold text-lg">Song Title 2</p>
                                        <p className="text-gray-400 text-sm">Release Date: Jan 15, 2025 | Streams: 850K</p>
                                    </div>
                                </motion.div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                className="mt-6 bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-2 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition"
                            >
                                Add New Release
                            </motion.button>
                        </motion.div>

                        {/* Social Media & Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            className="bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-800"
                        >
                            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Connect & Stats</h3>
                            <div className="flex justify-between items-center">
                                <div className="flex gap-6">
                                    <a href="#" className="text-purple-400 hover:text-purple-300 transition font-semibold">Twitter</a>
                                    <a href="#" className="text-purple-400 hover:text-purple-300 transition font-semibold">Instagram</a>
                                    <a href="#" className="text-purple-400 hover:text-purple-300 transition font-semibold">Spotify</a>
                                </div>
                                <div className="text-gray-300">
                                    <p>Fans: <span className="text-purple-400 font-bold">12.5K</span></p>
                                    <p>Total Streams: <span className="text-purple-400 font-bold">3.8M</span></p>
                                </div>
                            </div>
                        </motion.div>
                    </section>
                </main>
            </div>
        </div>
    );
}