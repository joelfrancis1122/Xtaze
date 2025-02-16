import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import Login from "./pages/User/LoginPage";
import Cursor from "./features/cursor"; // Import custom cursor
import Signup from "./pages/User/SignUpPage";
import OTPVerification from "./pages/User/OtpPage"

import UploadMusicPage from "./pages/Provider/UploadTrackPage";
import MusicInterface from "./pages/User/GuestPage";
import Home from "./pages/User/HomePage";
import AdminDashboard from "./pages/Admin/DashboardPage";
import GenreManagement from "./pages/Admin/GenrePage";
import ArtistList from "./pages/Admin/ArtistPage";
import { Provider } from "react-redux";
import { store, persistor } from "./store/store"
import { PersistGate } from "redux-persist/integration/react";
import UserPrivateRoute from "./pages/User/UserPrivateRoute";
import ArtistDashboard from "./pages/Artist/ArtistDashboard";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminProtectedRoute from "./pages/Admin/AdminPrivateRoute";
import ArtistLogin from "./pages/Artist/ArtistLogin";
import ArtistProtectRoute from "./pages/Artist/ArtistPrivateRoute";
import NotFound from "./pages/404";

const App = () => {

  return (
    <Router>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>

          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                borderRadius: '12px',
                border: '0.1px solid rgba(255, 255, 255, 0.3)',
                padding: '16px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.3s ease-in-out',
              },
              className: 'premium-toaster backdrop-blur-md',
            }}
          />


          <Cursor />
          <Routes>
         {/* user */}
            <Route path="/" element={<Login />} />
            <Route path="/Signup" element={<Signup />} />
            <Route path="/Otp" element={<OTPVerification />} />
            <Route path="/Ghome" element={<MusicInterface />} />
            <Route path="/uploadTrack" element={<UploadMusicPage />} />
            {/* <Route path="/Home" element={<Home/>} /> */}



         {/* admin */}

            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/genre" element={<GenreManagement />} />
            <Route path="/admin/artists" element={<ArtistList />} />

         
         {/* artist */}
            <Route path="/artist" element={<ArtistLogin />} />
            {/* <Route path="/artist/dashboard" element={<ArtistDashboard />} /> */}
         
         
         {/* protected */}
         
            <Route element={<ArtistProtectRoute/>}>
              <Route path="/artist/dashboard" element={<ArtistDashboard />} />
            </Route>
            <Route element={<AdminProtectedRoute/>}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>
            <Route element={<UserPrivateRoute />}>
              <Route path="/Home" element={<Home />} />
            </Route>

            <Route path="*" element={<NotFound />} />

          </Routes>
        </PersistGate>
      </Provider>
    </Router>
  );
};

export default App;
