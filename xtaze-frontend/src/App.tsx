import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import Login from "./pages/Login";
import Cursor from "./features/cursor"; // Import custom cursor
import Signup from "./pages/SignIn";
import OTPVerification from "./pages/OtpPage";

import UploadMusicPage from "./pages/Artist/UploadMusicPage";
import MusicInterface from "./components/GuestPage";
import Home from "./pages/User/Home";
const App = () => {

  return (
    <Router>
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
        <Route path="/" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/Otp" element={<OTPVerification />} />
        <Route path="/GuestHome" element={<MusicInterface/>} />
        <Route path="/uploadTrack" element={<UploadMusicPage />} />
        <Route path="/Home" element={<Home/>} />
     
      </Routes>
    </Router>
  );
};

export default App;
