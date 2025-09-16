import { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../store/store";
import { clearSignupData, saveSignupData } from "../../redux/userSlice";
import { toast } from "sonner";
import Cropper, { Area } from "react-easy-crop";
import { Camera, Power, Search, Edit2, CheckCircle, XCircle } from "lucide-react";
import { becomeArtist, uploadProfileImage, updateUsername, checkUsername } from "../../services/userService";
import { UserSignupData } from "./types/IUser";
import profileImg from "../../assets/profile4.jpeg";
import SidebarX from "./userComponents/Sidebr";
import { cn } from "../../utils/utils";

// Custom debounce hook (enhanced for stability)
function useDebounce<T extends (...args: any[]) => void>(callback: T, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current); // Always clear previous timeout to prevent multiples
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay] // Stable if callback is memoized
  );
}

export default function Home() {
  const user = useSelector((state: RootState) => state.user.signupData) as UserSignupData | null;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | undefined>(undefined);
  const [showCropper, setShowCropper] = useState<boolean>(false);

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "unique" | "taken">("idle");

  useEffect(() => {
    setNewUsername(user?.username || "");
  }, [user]);

  const token = localStorage.getItem("token");

  // Stable callback for the API check (prevents recreation)
  const performUsernameCheck = useCallback(async (username: string, currentUserUsername: string | undefined) => {
    if (!username.trim() || username.trim() === currentUserUsername) {
      setUsernameStatus("idle");
      return;
    }
    if (username.trim().length < 3) {
      setUsernameStatus("idle"); // Early exit for invalid length
      return;
    }

    setUsernameStatus("checking");
    try {
      const isAvailable = await checkUsername(username.trim());
      setUsernameStatus(isAvailable ? "unique" : "taken");
    } catch (error: any) {
      console.error("Error checking username:", error);
      setUsernameStatus("taken");
      toast.error(error.message || "Error checking username availability", { position: "top-right" });
    }
  }, []); // No dependencies; uses params instead

  // Now debounce the stable callback (won't recreate unnecessarily)
  const checkUsernameAvailability = useDebounce(performUsernameCheck, 500);

  // Effect to trigger debounced check only when editing and username changes meaningfully
  useEffect(() => {
    if (isEditingUsername) {
      checkUsernameAvailability(newUsername, user?.username);
    } else {
      setUsernameStatus("idle");
    }
  }, [newUsername, isEditingUsername, checkUsernameAvailability, user?.username]); // Includes checkUsernameAvailability for completeness, but it's now stable

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
      try {
        const updatedUser = await uploadProfileImage(user?.id || "", cropped);
        dispatch(saveSignupData(updatedUser));
        toast.success("Profile picture updated!");
      } catch {
        toast.error("Error uploading profile picture");
      }
    }
  };

  const handleUpdateUsername = async () => {
    if (!user?.id || !token) {
      toast.error("Please log in to update username");
      return;
    }
    if (!newUsername.trim() || newUsername.length < 3) {
      toast.error("Username must be at least 3 characters long");
      return;
    }
    if (newUsername.trim() === user.username) {
      toast.error("New username is the same as the current username");
      setIsEditingUsername(false);
      return;
    }
    if (usernameStatus !== "unique") {
      toast.error("Username is not available");
      return;
    }
    try {
      const updatedUser = await updateUsername(user.id, newUsername);
      dispatch(saveSignupData(updatedUser));
      setIsEditingUsername(false);
      toast.success("Username updated successfully!");
    } catch {
      toast.error("Failed to update username");
    }
  };

  const handleSubscribe = () => navigate("/plans");

  const handleBecomeArtist = async () => {
    const confirm = window.confirm(
      "Are you sure you want to become an Artist? This is a permanent change, and you cannot revert."
    );
    if (!confirm) return;

    if (!user?.id) {
      toast.error("Please log in to become an artist");
      return;
    }

    try {
      await becomeArtist(user.id);
      dispatch(clearSignupData());
      toast.success("You are now an Artist!");
    } catch (error) {
      console.error("Error becoming an artist:", error);
      toast.error("Failed to become an artist");
    }
  };

  return (
    <div className="flex h-screen flex-col bg-black text-white">
      {/* Cropper Modal */}
      {showCropper && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-[#1d1d1d] p-4 rounded-lg shadow-lg w-[90vw] max-w-[280px] sm:max-w-[300px]">
            <h2 className="text-white text-base sm:text-lg font-bold mb-3">Crop Image</h2>
            <div className="relative w-full h-[200px] sm:h-[300px] bg-gray-800">
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
            <div className="flex justify-end mt-4 gap-2">
              <button
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-500 text-white rounded text-sm sm:text-base"
                onClick={() => setShowCropper(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500 text-white rounded text-sm sm:text-base"
                onClick={handleCropConfirm}
              >
                Crop & Upload
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 relative">
        <SidebarX>
          <main className="flex-1 min-h-screen bg-black transition-all duration-300">
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4">
              <nav className="md:hidden text-sm text-gray-400">
                <a
                  href="/home"
                  className="hover:text-white transition-colors"
                  onClick={(e) => { e.preventDefault(); navigate("/home"); }}
                >
                  Home
                </a>
                <span className="mx-2"> </span>
                <span className="text-white">Profile</span>
              </nav>
              <div className="relative w-full sm:w-auto">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="search"
                  placeholder="Search"
                  className="bg-[#242424] rounded-full py-2 pl-10 pr-4 w-full sm:w-[250px] text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                className="p-2 hover:bg-[#242424] rounded-full"
                onClick={handleLogout}
                aria-label="Log out"
              >
                <Power size={18} />
              </button>
            </header>

            <section className="px-4 sm:px-6 py-4">
              {/* Profile Section */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 group">
                  <div className="absolute inset-0.5 bg-red-500 opacity-50 rounded-full blur-md z-0"></div>
                  <img
                    src={(croppedImage as string) ?? user?.profilePic ?? profileImg}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover relative z-10"
                  />
                  <label
                    htmlFor="profile-upload"
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer z-20"
                  >
                    <Camera size={20} className="text-white" />
                  </label>
                  <input
                    type="file"
                    id="profile-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">{user?.username}</h2>
                  <p className="text-gray-400 text-sm sm:text-base">{user?.email}</p>
                </div>
              </div>

              {/* Personal Information */}
              <div className="py-4">
                <div className="mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Personal Information</h3>
                  <div className="bg-[#1d1d1d] p-4 sm:p-6 rounded-lg shadow-md">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
                      <div className="flex-1">
                        <p className="text-gray-400 text-base sm:text-lg">Username</p>
                        {isEditingUsername ? (
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-2">
                            <div className="relative w-full sm:max-w-xs">
                              <input
                                type="text"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                placeholder="Enter new username"
                                maxLength={15}
                                className="bg-[#242424] text-white p-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2">
                                {usernameStatus === "checking" && (
                                  <span className="text-gray-400 text-sm">Checking...</span>
                                )}
                                {usernameStatus === "unique" && (
                                  <CheckCircle size={18} className="text-green-500" />
                                )}
                                {usernameStatus === "taken" && (
                                  <XCircle size={18} className="text-red-500" />
                                )}
                              </span>
                            </div>

                            <div className="flex gap-2 mt-2 sm:mt-0">
                              <button
                                onClick={handleUpdateUsername}
                                disabled={usernameStatus !== "unique" || newUsername.trim() === user?.username || newUsername.trim().length < 3}
                                className={cn(
                                  "px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base transition-colors",
                                  usernameStatus === "unique" && newUsername.trim() !== user?.username && newUsername.trim().length >= 3
                                    ? "bg-blue-500 text-white hover:bg-blue-600"
                                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                                )}
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setIsEditingUsername(false);
                                  setNewUsername(user?.username || "");
                                  setUsernameStatus("idle");
                                }}
                                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm sm:text-base"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <p className="text-white text-base sm:text-lg font-semibold">{user?.username}</p>
                            <button
                              onClick={() => setIsEditingUsername(true)}
                              className="p-1 text-gray-400 hover:text-blue-500 transition"
                            >
                              <Edit2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-400 text-base sm:text-lg">Email</p>
                    <p className="text-white text-base sm:text-lg font-semibold">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Subscription Plan */}
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">Your Subscription Plan</h3>
              <div className="bg-[#1d1d1d] p-4 sm:p-6 rounded-xl shadow-lg flex flex-col items-center border border-gray-800 transition-all hover:shadow-xl">
                {user?.premium !== "Free" ? (
                  <div className="text-center space-y-2">
                    <p className="text-lg sm:text-xl font-semibold text-white">{user?.premium}</p>
                    <p className="text-sm text-gray-300">Enjoy full access to all features!</p>
                    <span className="inline-block bg-green-500 text-white text-xs sm:text-sm font-medium px-2.5 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <p className="text-base text-gray-400">You’re on the Free Plan</p>
                    <p className="text-sm text-gray-500">Upgrade to unlock premium features.</p>
                    <button
                      onClick={handleSubscribe}
                      className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 ease-in-out transform hover:scale-105 text-sm sm:text-base"
                    >
                      Upgrade Now
                    </button>
                  </div>
                )}
              </div>

              {/* Advanced Settings */}
              <h3 className="text-lg sm:text-xl font-bold mt-6 sm:mt-8 mb-4 text-white">Advanced Settings</h3>
              <div className="bg-[#1d1d1d] p-4 sm:p-6 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
                  <p className="text-white text-base sm:text-lg">Change Password</p>
                </div>
                <div
                  onClick={() => navigate("/equalizer")}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4"
                >
                  <p className="text-white text-base sm:text-lg">Equalizer</p>
                  <button
                    className="mt-2 sm:mt-0 bg-indigo-500 px-4 sm:px-5 py-1.5 sm:py-2 text-white rounded-lg hover:bg-red-600 transition text-sm sm:text-base"
                  >
                    Tune
                  </button>
                </div>
                {user?.role !== "Artist" && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div>
                      <p className="text-white text-base sm:text-lg">Become an Artist</p>
                      <p className="text-sm text-red-400">Warning: This is a permanent change</p>
                    </div>
                    <button
                      onClick={handleBecomeArtist}
                      className="mt-2 sm:mt-0 bg-red-500 px-4 sm:px-5 py-1.5 sm:py-2 text-white rounded-lg hover:bg-red-600 transition text-sm sm:text-base"
                    >
                      Become Artist
                    </button>
                  </div>
                )}
              </div>
            </section>
          </main>
        </SidebarX>
      </div>
    </div>
  );
}