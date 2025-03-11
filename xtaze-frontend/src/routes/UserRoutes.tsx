import { Routes, Route } from "react-router-dom";
import Login from "../pages/User/LoginPage";
import Signup from "../pages/User/SignUpPage";
import OTPVerification from "../pages/User/OtpPage";
import SubscriptionPlans from "../pages/User/Subscription";
import ProfilePage from "../pages/User/ProfilePage";
import SuccessPage from "../pages/User/success";
import CancelPage from "../pages/User/cancelPage";
import PlaylistsPage from "../pages/User/playlistPage";
import LikedSongsPage from "../pages/User/LikedSongs";
import UploadMusicPage from "../pages/Provider/UploadTrackPage";
import { WavyBackgroundDemo } from "../pages/User/rough";
import ForgotPassword from "../pages/User/forgotPassPage";
import ResetPassword from "../pages/User/ResetPassPage";

export const UserRoutes = () => (
    <>
    <Route path="/" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/otp" element={<OTPVerification />} />
    <Route path="/plans" element={<SubscriptionPlans />} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/success" element={<SuccessPage />} />
    <Route path="/cancel" element={<CancelPage />} />
    <Route path="/playlist" element={<PlaylistsPage />} />
    <Route path="/likedSongs" element={<LikedSongsPage />} />
    <Route path="/uploadTrack" element={<UploadMusicPage />} />
    <Route path="/rough" element={<WavyBackgroundDemo />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    </>
);
