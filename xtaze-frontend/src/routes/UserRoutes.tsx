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
import ArtistDetailsPage from "../pages/User/ArtistDetailsPage";
import UserPrivateRoute from "../pages/User/UserPrivateRoute";
import Home from "../pages/User/HomePage";
import { USER_ROUTE_PREFIX } from "../constants/routeConstants";
import AlbumSongsPage from "../pages/Artist/ALbumPageView";

export const UserRoutes = () => (
    <>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/otp" element={<OTPVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<UserPrivateRoute />}>
            <Route path={`${USER_ROUTE_PREFIX}/home`} element={<Home />} />
            <Route path={`${USER_ROUTE_PREFIX}/plans`} element={<SubscriptionPlans />} />
            <Route path={`${USER_ROUTE_PREFIX}/profile`} element={<ProfilePage />} />
            <Route path={`${USER_ROUTE_PREFIX}/success`} element={<SuccessPage />} />
            <Route path={`${USER_ROUTE_PREFIX}/cancel`} element={<CancelPage />} />
            <Route path={`${USER_ROUTE_PREFIX}/playlist/:userId`} element={<PlaylistsPage />} />
            <Route path={`${USER_ROUTE_PREFIX}/Albums`} element={< AlbumSongsPage/>} />

            <Route path={`${USER_ROUTE_PREFIX}/playlist/:userId/:id`} element={<PlaylistPageView />} />
            <Route path={`${USER_ROUTE_PREFIX}/likedsongs`} element={<LikedSongsPage />} />
            <Route path={`${USER_ROUTE_PREFIX}/uploadTrack`} element={<UploadMusicPage />} />
            <Route path={`${USER_ROUTE_PREFIX}/rough`} element={<WavyBackgroundDemo />} />
            <Route path={`${USER_ROUTE_PREFIX}/videos`} element={<YoutubeMusic />} />
            <Route path={`${USER_ROUTE_PREFIX}/radio`} element={<RadioPage />} />
            <Route path={`${USER_ROUTE_PREFIX}/equalizer`} element={<EqualizerPage />} />
            <Route path={`${USER_ROUTE_PREFIX}/recentSongs`} element={<RecentSongsPage />} />
            <Route path={`${USER_ROUTE_PREFIX}/explore`} element={<ExplorePage />} />
            <Route path={`${USER_ROUTE_PREFIX}/genre/:genre`} element={<GenrePage />} />
            <Route path={`${USER_ROUTE_PREFIX}/artists`} element={<ArtistPage />} />
            <Route path={`${USER_ROUTE_PREFIX}/artists/:artistId`} element={<ArtistDetailsPage />} />
        </Route>

    </>
);
