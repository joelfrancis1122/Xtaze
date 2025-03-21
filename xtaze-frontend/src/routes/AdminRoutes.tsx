import { Routes, Route } from "react-router-dom";
import AdminLogin from "../pages/Admin/AdminLogin";
import GenreManagement from "../pages/Admin/GenrePage";
import ArtistList from "../pages/Admin/ArtistPage";
import AdminBannerManagement from "../pages/Admin/BannerPage";
import AdminCouponPage from "../pages/Admin/CouponPage";

export const AdminRoutes = () => (
    <>
    <Route path="/admin" element={<AdminLogin />} />
    <Route path="/admin/genre" element={<GenreManagement />} />
    <Route path="/admin/artists" element={<ArtistList />} />
    <Route path="/admin/banner" element={<AdminBannerManagement />} />
    <Route path="/admin/coupons" element={<AdminCouponPage />} />

    </>
);
