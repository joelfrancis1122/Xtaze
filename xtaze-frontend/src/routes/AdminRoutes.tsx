import { Route } from "react-router-dom";
import AdminLogin from "../pages/Admin/AdminLogin";
import GenreManagement from "../pages/Admin/GenrePage";
import ArtistList from "../pages/Admin/ArtistPage";
import AdminBannerManagement from "../pages/Admin/BannerPage";
import AdminCouponPage from "../pages/Admin/CouponPage";
import AdminSubscriptionPage from "../pages/Admin/Subscription";
import AdminMusicMonetizationPage from "../pages/Admin/monetizationPage ";
import AdminSubscriptionHistoryPage from "../pages/Admin/historyPage";
import AdminPayoutSuccessPage from "../pages/Admin/AdminSuccess";
import AdminPayoutCancelPage from "../pages/Admin/AdminCancelPage";
import AdminAnalytics from "../pages/Admin/AdminAnalytics";
import AdminProtectedRoute from "../pages/Admin/AdminPrivateRoute";
import AdminDashboard from "../pages/Admin/DashboardPage";

export const AdminRoutes = () => (
    <>
        <Route path="/admin" element={<AdminLogin />} />
        <Route element={<AdminProtectedRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            <Route path="/admin/genre" element={<GenreManagement />} />
            <Route path="/admin/artists" element={<ArtistList />} />
            <Route path="/admin/banner" element={<AdminBannerManagement />} />
            <Route path="/admin/coupons" element={<AdminCouponPage />} />
            <Route path="/admin/subscriptions" element={<AdminSubscriptionPage />} />
            <Route path="/admin/monetization" element={<AdminMusicMonetizationPage />} />
            <Route path="/admin/history" element={<AdminSubscriptionHistoryPage />} />
            <Route path="/admin/payoutSuccess" element={<AdminPayoutSuccessPage />} />
            <Route path="/admin/payoutCancel" element={<AdminPayoutCancelPage />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />

        </Route>


    </>
);
