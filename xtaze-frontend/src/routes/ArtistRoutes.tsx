import { Routes, Route } from "react-router-dom";
import ArtistLogin from "../pages/Artist/ArtistLogin";
import ArtistProfile from "../pages/Artist/ArtistProfile";
import ArtistSongImprovementsPage from "../pages/Artist/ArtistMonetization";
import { ArtistSongUpdatePage } from "../pages/Artist/ArtistTrackUpdate";

export const ArtistRoutes = () => (
    <>
    <Route path="/artist" element={<ArtistLogin />} />
    <Route path="/artist/profile" element={<ArtistProfile />} />
    <Route path="/artist/monetization" element={<ArtistSongImprovementsPage/>} />
    <Route path="/artist/analytics" element={<ArtistSongUpdatePage/>} />
    </>
);
