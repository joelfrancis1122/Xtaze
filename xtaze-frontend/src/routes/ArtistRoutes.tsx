import { Route } from "react-router-dom";
import ArtistLogin from "../pages/Artist/ArtistLogin";
import ArtistProfile from "../pages/Artist/ArtistProfile";
import ArtistSongImprovementsPage from "../pages/Artist/ArtistMonetization";
import { ArtistSongUpdatePage } from "../pages/Artist/ArtistTrackUpdate";
import ArtistProtectRoute from "../pages/Artist/ArtistPrivateRoute";
import ArtistDashboard from "../pages/Artist/ArtistDashboard";
import ArtistUploadTracks from "../pages/Artist/ArtistUploadTracks";

export const ArtistRoutes = () => (
    <>

        <Route path="/artist" element={<ArtistLogin />} />
        <Route element={<ArtistProtectRoute />}>
            <Route path="/artist/releases" element={<ArtistUploadTracks />} />
            <Route path="/artist/dashboard" element={<ArtistDashboard />} />
            <Route path="/artist/profile" element={<ArtistProfile />} />
            <Route path="/artist/monetization" element={<ArtistSongImprovementsPage />} />
            <Route path="/artist/analytics" element={<ArtistSongUpdatePage />} />
        </Route>
    </>
);
