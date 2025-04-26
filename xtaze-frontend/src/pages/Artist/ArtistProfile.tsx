import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../store/store";
import { toast } from "sonner";
import Cropper, { Area } from "react-easy-crop";
import { Camera, CheckCircle, Verified } from "lucide-react";
import ProfilePage from "../../assets/profile4.jpeg";
import ArtistSidebar from "./artistComponents/artist-aside";
import { saveArtistData } from "../../redux/artistSlice";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import artistService, { getVerificationStatus, requestVerification, updateArtistUsername } from "../../services/artistService";

interface Track {
  _id: string;
  title: string;
  releaseDate: string;
  listeners: string[];
}

interface VerificationStatus {
  status: "pending" | "approved" | "rejected" | "unsubmitted" | "processing";
  idProof?: string;
  feedback?: string | null;
}

export default function ArtistProfile() {
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
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [usernameText, setUsernameText] = useState<string>(user?.username || "");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [verification, setVerification] = useState<VerificationStatus>({ status: "unsubmitted" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const token = localStorage.getItem("artistToken");

  useEffect(() => {
    if (!token) {
      console.error("No token found. Please login.");
      navigate("/artist");
      return;
    }

    const fetchData = async () => {
      if (!user?._id) return;

      try {
        const fetchedTracks = await artistService.fetchArtistTracks(user._id, token);
        setTracks(fetchedTracks);
        console.log("Fetched tracks:", fetchedTracks);

        const verificationData = await getVerificationStatus(user._id, token);
        setVerification(verificationData || { status: "unsubmitted" });
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setTracks([]);
        toast.error("Failed to load profile data.");
      }
    };

    fetchData();
  }, [navigate, user?._id, token]);

  useEffect(() => {
    setUsernameText(user?.username || "");
    setBioText(String(user?.bio || ""));
  }, [user?.username, user?.bio]);

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
    if (!user?._id || !token) {
      toast.error("User ID or token not found.");
      return;
    }

    try {
      if (field === "profileImage") {
        const updatedUser = await artistService.uploadProfileImage(user._id, mediaData, token);
        dispatch(saveArtistData(updatedUser));
        toast.success("Profile picture updated!");
      } else {
        const updatedUser = await artistService.updateArtistBanner(user._id, mediaData, token);
        dispatch(saveArtistData(updatedUser));
        setCroppedCoverMedia(updatedUser.banner);
        toast.success("Banner updated!");
      }
    } catch (error: any) {
      console.error(`Error uploading ${field}:`, error);
      toast.error(error.message || "Something went wrong. Please try again.");
    }
  };

  const handleBioSave = async () => {
    if (!bioText.trim()) {
      toast.error("Bio cannot be empty.");
      return;
    }

    if (!user?._id || !token) {
      toast.error("User ID or token not found.");
      return;
    }

    try {
      const updatedUser = await artistService.updateArtistBio(user._id, bioText, token);
      dispatch(saveArtistData(updatedUser));
      setIsEditingBio(false);
      toast.success("Bio updated successfully!");
    } catch (error: any) {
      console.error("Error updating bio:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    }
  };

  const handleUsernameSave = async () => {
    if (!usernameText.trim()) {
      toast.error("Username cannot be empty.");
      return;
    }
    if (usernameText.length < 3) {
      toast.error("Username must be at least 3 characters long.");
      return;
    }

    if (!user?._id || !token) {
      toast.error("User ID or token not found.");
      return;
    }

    try {
      const updatedUser = await updateArtistUsername(user._id, usernameText, token);
      dispatch(saveArtistData(updatedUser));
      setIsEditingUsername(false);
      toast.success("Username updated successfully!");
    } catch (error: any) {
      console.error("Error updating username:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleVerificationSubmit = async () => {
    if (!selectedFile || !user?._id || !token) {
      toast.error("Please select an ID proof file or check login status.");
      return;
    }

    setVerification({ status: "processing" });

    const formData = new FormData();
    formData.append("idProof", selectedFile);

    try {
      await requestVerification(user._id, formData, token);
      setVerification({ status: "pending" });
      toast.success("Verification request submitted!");
      setSelectedFile(null);
    } catch (error: any) {
      setVerification({ status: "unsubmitted" });
      toast.error(error.message || "Failed to submit verification request.");
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
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 opacity-0 hover:opacity-60 cursor-pointer"
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
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-full opacity-0 hover:opacity-60 cursor-pointer"
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
                {isEditingUsername ? (
                  <div className="flex flex-col gap-2">
                    <input
                      value={usernameText}
                      onChange={(e) => setUsernameText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUsernameSave();
                        if (e.key === "Escape") {
                          setIsEditingUsername(false);
                          setUsernameText(user?.username || "");
                        }
                      }}
                      className="text-xl font-semibold text-white bg-black border border-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-white w-fit"
                      placeholder="Enter your username"
                      maxLength={50}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        className="bg-black text-white border border-white"
                        onClick={() => {
                          setIsEditingUsername(false);
                          setUsernameText(user?.username || "");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-black text-white border border-white"
                        onClick={handleUsernameSave}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-2 hover:underline cursor-pointer"
                    onClick={() => !isEditingBio && setIsEditingUsername(true)}
                  >
                    <h2 className="text-xl font-semibold text-white">{user?.username}</h2>
                    {verification.status === "approved" && (
                      <Verified size={30} className="text-blue-600" />
                    )}
                  </div>
                )}
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
                    {user?.bio || "Craft your story here. Share your journey, inspirations, and what drives your music."}
                  </p>
                  <Button
                    className="mt-4 bg-black text-white border border-white"
                    onClick={() => setIsEditingBio(true)}
                    disabled={isEditingUsername}
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
                      <p className="text-white text-sm">Listeners: {track.listeners.length.toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-white">No tracks available.</p>
                )}
              </div>
            </Card>

            {/* Verification Process Section */}
            <Card className="p-6 bg-black border border-white">
              <h2 className="text-lg font-semibold text-white mb-4">Verification Process</h2>
              {verification.status === "unsubmitted" || verification.status === "rejected" ? (
                <div>
                  <p className="text-white mb-4">
                    Submit an ID proof to start the verification process. An admin will review your submission.
                  </p>
                  <label htmlFor="id-proof-upload" className="text-white">
                    Upload ID Proof:
                  </label>
                  <div className="flex items-center gap-4 mt-2">
                    <input
                      type="file"
                      id="id-proof-upload"
                      accept="image/*,application/pdf"
                      className="block w-full text-white bg-black border border-white rounded-md p-2"
                      onChange={handleFileChange}
                    />
                    <Button
                      className="bg-black text-white border border-white"
                      onClick={handleVerificationSubmit}
                      disabled={!selectedFile}
                    >
                      Submit
                    </Button>
                  </div>
                  {verification.status === "rejected" && verification.feedback && (
                    <p className="text-red-500 mt-2">Rejection Reason: {verification.feedback}</p>
                  )}
                </div>
              ) : verification.status === "processing" ? (
                <p className="text-yellow-500">Processing your verification request...</p>
              ) : verification.status === "pending" ? (
                <p className="text-yellow-500">Your verification is under review...</p>
              ) : verification.status === "approved" ? (
                <p className="text-green-500 flex items-center gap-2">
                  <CheckCircle size={20} /> You are a verified artist!
                </p>
              ) : null}
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}