

import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../store/store";
import { clearSignupData, saveSignupData } from "../../redux/userSlice";
import { toast } from "sonner";
import Cropper, { Area } from "react-easy-crop";
import { Camera, Power, Search, Edit2 } from "lucide-react";
import Sidebar from "./userComponents/SideBar";
import { becomeArtist, uploadProfileImage, updateUsername } from "../../services/userService";
import { UserSignupData } from "./types/IUser";
import profileImg from "../../assets/profile4.jpeg";

export default function Home() {
  const user = useSelector((state: RootState) => state.user.signupData) as UserSignupData | null;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | undefined>(undefined);
  const [showCropper, setShowCropper] = useState<boolean>(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || "");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found. Please login.");
    }
    // Sync newUsername with user.username
    setNewUsername(user?.username || "");
  }, [user]);

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

  const token = localStorage.getItem("token");

  const handleCropConfirm = async () => {
    const cropped = await getCroppedImage();
    if (cropped) {
      setCroppedImage(cropped);
      setShowCropper(false);
      try {
        const updatedUser = await uploadProfileImage(user?._id || "", cropped, token as string);
        dispatch(saveSignupData(updatedUser));
        toast.success("Profile picture updated!");
      } catch (error) {
        toast.error("Error uploading profile picture");
      }
    }
  };

  const handleUpdateUsername = async () => {
    if (!user?._id || !token) {
      toast.error("Please log in to update username");
      return;
    }
    if (!newUsername.trim() || newUsername.length < 3) {
      toast.error("Username must be at least 3 characters long");
      return;
    }
    try {
      const updatedUser = await updateUsername(user._id, newUsername, token);
      dispatch(saveSignupData(updatedUser));
      setIsEditingUsername(false);
      toast.success("Username updated successfully!");
    } catch (error) {
      toast.error("Failed to update username");
    }
  };

  const handleSubscribe = () => {
    navigate("/plans");
  };

  const handleBecomeArtist = async () => {
    const confirm = window.confirm(
      "Are you sure you want to become an Artist? This is a permanent change, and you cannot revert to a regular user account once you proceed."
    );
    if (!confirm) return;

    if (!user?._id) {
      toast.error("Please log in to become an artist");
      return;
    }

    try {
      await becomeArtist(user._id);
      dispatch(clearSignupData());
      toast.success("You are now an Artist!");
    } catch (error) {
      console.error("Error becoming an artist:", error);
      toast.error("Failed to become an artist");
    }
  };

  return (
    <div className="flex h-screen flex-col bg-black text-white">
      {showCropper && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-[#1d1d1d] p-4 rounded-lg shadow-lg">
            <h2 className="text-white text-lg font-bold mb-3">Crop Image</h2>
            <div className="relative w-[300px] h-[300px] bg-gray-800">
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
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded mr-2"
                onClick={() => setShowCropper(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={handleCropConfirm}
              >
                Crop & Upload
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}
        <main className="flex-1 min-h-screen ml-64 bg-black">
          <header className="flex justify-between items-center p-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="search"
                placeholder="Search"
                className="bg-[#242424] rounded-full py-2 pl-10 pr-4 w-[300px] text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              className="p-2 hover:bg-[#242424] rounded-full"
              onClick={handleLogout}
            >
              <Power size={20} />
            </button>
          </header>

          <section className="px-6 py-4">
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 group">
                <div className="absolute inset-0.5 bg-red-500 opacity-50 rounded-full blur-md z-0"></div>
                <img
                  src={(croppedImage as string) ?? user?.profilePic ?? profileImg}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover relative z-10"
                />
                <label
                  htmlFor="profile-upload"
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer z-20"
                >
                  <Camera size={24} className="text-white" />
                </label>
                <input
                  type="file"
                  id="profile-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white">{user?.username}</h2>
                <p className="text-gray-400">{user?.email}</p>
              </div>
            </div>
            <div className="py-4">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-3">Personal Information</h3>
                <div className="bg-[#1d1d1d] p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-gray-400 text-lg">Username</p>
                      {isEditingUsername ? (
                        <div className="flex items-center gap-3 mt-2">
                          <input
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            placeholder="Enter new username"
                            className="bg-[#242424] text-white p-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-xs"
                          />
                          <button
                            onClick={handleUpdateUsername}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setIsEditingUsername(false);
                              setNewUsername(user?.username || "");
                            }}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <p className="text-white text-lg font-semibold">{user?.username}</p>
                          <button
                            onClick={() => setIsEditingUsername(true)}
                            className="p-1 text-gray-400 hover:text-blue-500 transition"
                          >
                            <Edit2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-400 text-lg">Email</p>
                  <p className="text-white text-lg font-semibold">{user?.email}</p>
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-6">Your Subscription Plan</h3>
            <div className="bg-[#1d1d1d] p-6 rounded-xl shadow-lg flex flex-col items-center border border-gray-800 transition-all hover:shadow-xl">
              {user?.premium !== "Free" ? (
                <div className="text-center space-y-2">
                  <p className="text-xl font-semibold text-white">{user?.premium}</p>
                  <p className="text-sm text-gray-300">Enjoy full access to all features!</p>
                  <span className="inline-block bg-green-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                    Active
                  </span>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-base text-gray-400">You’re on the Free Plan</p>
                  <p className="text-sm text-gray-500">Upgrade to unlock premium features.</p>
                  <button
                    onClick={handleSubscribe}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 ease-in-out transform hover:scale-105"
                  >
                    Upgrade Now
                  </button>
                </div>
              )}
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4 text-white">Advanced Settings</h3>
            <div className="bg-[#1d1d1d] p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <p className="text-white">Change Password</p>
              </div>
              <div
                onClick={() => navigate("/equalizer")}
                className="flex items-center justify-between mb-4"
              >
                <p className="text-white">Equalizer</p>
                <button className="bg-indigo-500 px-5 py-2 text-white rounded-lg hover:bg-red-600 transition">
                  Tune
                </button>
              </div>
              {user?.role !== "Artist" && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Become an Artist</p>
                    <p className="text-sm text-red-400">Warning: This is a permanent change</p>
                  </div>
                  <button
                    onClick={handleBecomeArtist}
                    className="bg-red-500 px-5 py-2 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    Become Artist
                  </button>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}