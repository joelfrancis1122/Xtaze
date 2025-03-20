import { Route } from "react-router-dom";
import UserPrivateRoute from "../pages/User/UserPrivateRoute";
import AdminProtectedRoute from "../pages/Admin/AdminPrivateRoute";
import ArtistProtectRoute from "../pages/Artist/ArtistPrivateRoute";
import Home from "../pages/User/HomePage";
import AdminDashboard from "../pages/Admin/DashboardPage";
import ArtistUploadTracks from "../pages/Artist/ArtistUploadTracks";
import ArtistDashboard from "../pages/Artist/ArtistDashboard";
export const ProtectedRoutes = () => (
  <>
    <Route element={<UserPrivateRoute />}>
      <Route path="/home" element={<Home />} />
    </Route>
    <Route element={<AdminProtectedRoute />}>
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Route>
    <Route element={<ArtistProtectRoute />}>
      <Route path="/artist/releases" element={<ArtistUploadTracks />} />
      <Route path="/artist/dashboard" element={<ArtistDashboard />} />
    </Route>
  </>
);