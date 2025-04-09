import { Route } from "react-router-dom";
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
import ForgotPassword from "../pages/User/ForgotPassPage";
import ResetPassword from "../pages/User/ResetPassPage";
import PlaylistPageView from "../pages/User/PlaylistViewPage";
import YoutubeMusic from "../pages/User/VideosPage";
import RadioPage from "../pages/User/RadioPage";
import EqualizerPage from "../pages/User/EqualizerPage";
import RecentSongsPage from "../pages/User/RecentSongs";
import ExplorePage from "../pages/User/ExplorePage";
import GenrePage from "../pages/User/SongsByGenre";
import ArtistPage from "../pages/User/ArtistsPage";

export const UserRoutes = () => (
    <>
    <Route path="/" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/otp" element={<OTPVerification />} />
    <Route path="/plans" element={<SubscriptionPlans />} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/success" element={<SuccessPage />} />
    <Route path="/cancel" element={<CancelPage />} />
    <Route path="/playlist/:userId" element={<PlaylistsPage />} />
    <Route path="/playlist/:userId/:id" element={<PlaylistPageView />} />
    <Route path="/likedsongs" element={<LikedSongsPage />} />
    <Route path="/uploadTrack" element={<UploadMusicPage />} />
    <Route path="/rough" element={<WavyBackgroundDemo />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/videos" element={<YoutubeMusic />} />
    <Route path="/radio" element={<RadioPage />} />
    <Route path="/equalizer" element={<EqualizerPage />} />
    <Route path="/recentSongs" element={<RecentSongsPage />} />
    <Route path="/explore" element={<ExplorePage/>} />
    <Route path="/genre/:genre" element={<GenrePage/>} />
    <Route path="/artists" element={<ArtistPage/>} />

    </>
);
