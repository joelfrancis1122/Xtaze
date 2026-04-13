import { Routes, Route } from "react-router-dom";
import NotFound from "../pages/404";
import { UserRoutes } from "./UserRoutes";
import { AdminRoutes } from "./AdminRoutes";
import { ArtistRoutes } from "./ArtistRoutes";

export const AppRoutes = () => (
  <Routes>
    {UserRoutes()}
    {AdminRoutes()}
    {ArtistRoutes()}
    <Route path="*" element={<NotFound />} />
  </Routes>
);