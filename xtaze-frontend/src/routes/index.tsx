import { Routes, Route } from "react-router-dom";
import NotFound from "../pages/404";
import { UserRoutes } from "./UserRoutes";
import { AdminRoutes } from "./AdminRoutes";
import { ArtistRoutes } from "./ArtistRoutes";
import { ProtectedRoutes } from "./ProtectedRoutes";

export const AppRoutes = () => (
  <Routes>
    {UserRoutes()}
    {AdminRoutes()}
    {ArtistRoutes()}
    {ProtectedRoutes()}
    <Route path="*" element={<NotFound />} />
  </Routes>
);