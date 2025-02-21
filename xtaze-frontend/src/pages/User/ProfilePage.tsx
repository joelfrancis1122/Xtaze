import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../store/store";
import { clearSignupData, saveSignupData } from "../../redux/userSlice";
import axios from "axios";
import { toast } from "sonner";
import Cropper, { Area } from "react-easy-crop";
import { Camera, Power, Search } from "lucide-react";
import Sidebar from "./userComponents/SideBar";
import ProfilePage from "../../assets/profile6.jpeg";

export default function Home() {
    const user = useSelector((state: RootState) => state.user.signupData);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState<number>(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [croppedImage, setCroppedImage] = useState<string | undefined>(undefined);
    const [showCropper, setShowCropper] = useState<boolean>(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found. Please login.");
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        dispatch(clearSignupData());
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
                dispatch(saveSignupData(response.data.user));
                toast.success("Profile picture updated!");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    };

    const handleSubscribe =()=>{
        navigate('/plans')
    }
    return (
        <div className="flex h-screen flex-col bg-black text-white">
            {showCropper && (
                <div className="fixed inset-0 bg-red bg-opacity-30 backdrop-blur-md flex items-center justify-center z-50">
                    <div className="bg-black p-4 rounded-lg shadow-lg">
                        <h2 className="text-black text-lg font-bold mb-3">Crop Image</h2>
                        <div className="relative w-[300px] h-[300px] bg-gray-200">
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
                        <div className="flex justify-end mt-4">
                            <button className="px-4 py-2 bg-gray-500 text-white rounded mr-2" onClick={() => setShowCropper(false)}>
                                Cancel
                            </button>
                            <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={handleCropConfirm}>
                                Crop & Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 min-h-screen ml-64 bg-black">
                    <header className="flex justify-between items-center p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />

                            <input
                                type="search"
                                placeholder="Search"
                                className="bg-[#242424] rounded-full py-2 pl-10 pr-4 w-[300px] text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <button className="p-2 hover:bg-[#242424] rounded-full" onClick={handleLogout}>
                            <Power size={20} />
                        </button>
                    </header>

                    <section className="px-6 py-4">
                        <div className="flex items-center gap-6">
                            <div className="relative w-24 h-24 group">
                                    <div className="absolute inset-0.5 bg-red-500 opacity-50 rounded-full blur-md z-0"></div>

                                <img
                                    src={(croppedImage as string) ?? user?.profilePic ?? ProfilePage


                                        
                                    }
                                    alt="Profile"
                                    className="w-24 h-24 rounded-full object-cover relative z-10"
                                />

                                <label
                                    htmlFor="profile-upload"
                                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer z-20"
                                >
                                    <Camera size={24} className="text-white" />
                                </label>

                                <input type="file" id="profile-upload" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-white">{user?.username}</h2>
                                <p className="text-gray-400">{user?.email}</p>
                            </div>
                        </div>
                        <div className="py-4">
                            {/* Personal Information (Outside Main Card) */}
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-white mb-3">Personal Information</h3>
                                <div className="bg-[#1d1d1d] p-6 rounded-lg shadow-md">
                                    <p className="text-gray-400 text-lg">Username</p>
                                    <p className="text-white text-lg font-semibold mb-2">{user?.username}</p>

                                    <p className="text-gray-400 text-lg">Email</p>
                                    <p className="text-white text-lg font-semibold">{user?.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Subscription Plan */}
                        <h3 className="text-xl font-bold mt-1 mb-4 text-white">Subscription Plan</h3>
                        <div className="bg-[#1d1d1d] p-6 rounded-lg shadow-md flex flex-col items-center">
                            {user?.premium ? (
                                <div className="text-center">
                                    <p className="text-lg text-white font-semibold">Premium Plan</p>
                                    <p className="text-gray-400">Expires on: {user.year}</p>
                                    <button className="bg-red-500 px-5 py-2 mt-3 text-white rounded-lg hover:bg-red-600 transition">
                                        Cancel Subscription
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="text-gray-400">You are not subscribed to any plan.</p>
                                    <button className="bg-blue-500 px-5 py-2 mt-3 text-white rounded-lg hover:bg-blue-600 transition" onClick={handleSubscribe}>
                                        Upgrade Now
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Advanced Settings */}
                        <h3 className="text-xl font-bold mt-8 mb-4 text-white">Advanced Settings</h3>
                        <div className="bg-[#1d1d1d] p-6 rounded-lg shadow-md">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-white">Change Password</p>
                                <button className="bg-blue-500 px-5 py-2 text-white rounded-lg hover:bg-blue-600 transition">
                                    Update
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <p className="text-white">Equallizer</p>
                                <button className="bg-indigo-500 px-5 py-2 text-white rounded-lg hover:bg-red-600 transition">
                                    Tune
                                </button>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
            
        </div>
    )
}