import { Routes, Route } from "react-router-dom";
import ArtistLogin from "../pages/Artist/ArtistLogin";
import ArtistProfile from "../pages/Artist/ArtistProfile";

export const ArtistRoutes = () => (
    <>
    <Route path="/artist" element={<ArtistLogin />} />
    <Route path="/artist/profile" element={<ArtistProfile />} />
    </>
);
