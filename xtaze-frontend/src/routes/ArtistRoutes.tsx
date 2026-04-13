import { Route } from "react-router-dom";
import ArtistLogin from "../pages/Artist/ArtistLogin";
import ArtistProfile from "../pages/Artist/ArtistProfile";
import ArtistSongImprovementsPage from "../pages/Artist/ArtistMonetization";
import { ArtistSongUpdatePage } from "../pages/Artist/ArtistTrackUpdate";
import ArtistProtectRoute from "../pages/Artist/ArtistPrivateRoute";
import ArtistDashboard from "../pages/Artist/ArtistDashboard";
import ArtistUploadTracks from "../pages/Artist/ArtistUploadTracks";
import { ARTIST_ROUTE_PREFIX } from "../constants/routeConstants";
import AlbumSongsPage from "../pages/Artist/ALbumPageView";

export const ArtistRoutes = () => (
    <>
    z

        <Route path={`${ARTIST_ROUTE_PREFIX}`} element={<ArtistLogin />} />
        <Route element={<ArtistProtectRoute />}>
            <Route path={`${ARTIST_ROUTE_PREFIX}/releases`} element={<ArtistUploadTracks />} />
            <Route path={`${ARTIST_ROUTE_PREFIX}/albums/:albumId`} element={<AlbumSongsPage />} />
            <Route path={`${ARTIST_ROUTE_PREFIX}/dashboard`} element={<ArtistDashboard />} />
            <Route path={`${ARTIST_ROUTE_PREFIX}/profile`} element={<ArtistProfile />} />
            <Route path={`${ARTIST_ROUTE_PREFIX}/monetization`} element={<ArtistSongImprovementsPage />} />
            <Route path={`${ARTIST_ROUTE_PREFIX}/analytics`} element={<ArtistSongUpdatePage />} />
        </Route>
    </>
);
