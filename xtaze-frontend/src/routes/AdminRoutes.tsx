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
import { ADMIN_ROUTE_PREFIX } from "../constants/routeConstants";

export const AdminRoutes = () => (
    <>
        <Route path="/admin" element={<AdminLogin />} />
        <Route element={<AdminProtectedRoute />}>
            <Route path={`${ADMIN_ROUTE_PREFIX}/dashboard`} element={<AdminDashboard />} />
            <Route path={`${ADMIN_ROUTE_PREFIX}/genre`} element={<GenreManagement />} />
            <Route path={`${ADMIN_ROUTE_PREFIX}/artists`} element={<ArtistList />} />
            <Route path={`${ADMIN_ROUTE_PREFIX}/banner`} element={<AdminBannerManagement />} />
            <Route path={`${ADMIN_ROUTE_PREFIX}/coupons`} element={<AdminCouponPage />} />
            <Route path={`${ADMIN_ROUTE_PREFIX}/subscriptions`} element={<AdminSubscriptionPage />} />
            <Route path={`${ADMIN_ROUTE_PREFIX}/monetization`} element={<AdminMusicMonetizationPage />} />
            <Route path={`${ADMIN_ROUTE_PREFIX}/history`} element={<AdminSubscriptionHistoryPage />} />
            <Route path={`${ADMIN_ROUTE_PREFIX}/payoutSuccess`} element={<AdminPayoutSuccessPage />} />
            <Route path={`${ADMIN_ROUTE_PREFIX}/payoutCancel`} element={<AdminPayoutCancelPage />} />
            <Route path={`${ADMIN_ROUTE_PREFIX}/analytics`} element={<AdminAnalytics />} />

        </Route>


    </>
);
