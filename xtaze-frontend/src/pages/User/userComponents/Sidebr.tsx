"use client";
import { useState } from "react";
import {
  Sidebar,
  SidebarBody,
} from "../../../components/ui/userSideBar";
import {
  LogOut,
  User,
  HomeIcon,
  Music,
  Video,
  ListMusic,
  Disc,
  Heart,
  Sliders,
  Users,
  Crown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../../utils/utils";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../store/store";
import { useNavigate } from "react-router-dom";
import ProfileP from "../../../assets/profile4.jpeg";
import { clearSignupData } from "../../../redux/userSlice";
import { clearAudioState } from "../../../redux/audioSlice";

export default function SidebarX({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const signupData = useSelector((state: RootState) => state.user.signupData);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      const audio = document.querySelector("audio") as HTMLAudioElement | null;
      if (audio) {
        audio.pause();
        audio.src = "";
      }
      localStorage.removeItem("token");
      dispatch(clearSignupData());
      dispatch(clearAudioState());
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const links = [
    { label: "Home", icon: HomeIcon, onClick: () => navigate("/") },
    ...(signupData?.premium !== "Free"
      ? [{ label: "Explore", icon: Music, onClick: () => navigate("/explore") }]
      : []),
    { label: "Videos", icon: Video, onClick: () => navigate("/videos") },
    ...(signupData?.premium !== "Free"
      ? [
        { label: "Liked", icon: Heart, onClick: () => navigate("/likedsongs") },
        { label: "Artists", icon: Users, onClick: () => navigate("/artists") },
        { label: "Albums", icon: Disc, onClick: () => navigate("/albums") },
        { label: "Playlists", icon: ListMusic, onClick: () => navigate(`/playlist/${signupData?.id}`) },
        { label: "Recent", icon: Music, onClick: () => navigate("/recentSongs") },
        { label: "Equalizer", icon: Sliders, onClick: () => navigate("/equalizer") },
      ]
      : []),
    { label: "Profile", icon: User, onClick: () => navigate("/profile") },
    { label: "Logout", icon: LogOut, onClick: handleLogout },
  ];

  return (
    <div className={cn("flex w-full flex-1 flex-col md:flex-row overflow-hidden h-screen")}>
      <Sidebar open={open} setOpen={setOpen} animate>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? (
              <Logo signupData={signupData} handleProfileClick={handleProfileClick} />
            ) : (
              <LogoIcon signupData={signupData} handleProfileClick={handleProfileClick} />
            )}

            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <button
                  key={idx}
                  onClick={link.onClick}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors",
                    "text-neutral-700 dark:text-neutral-200"
                  )}
                >
                  <link.icon className="h-5 w-5 shrink-0" />
                  {open && <span className="text-sm font-medium">{link.label}</span>}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors"
          >
            {open ? (
              <>
                <ChevronLeft className="h-5 w-5" />
              </>
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        </SidebarBody>
      </Sidebar>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

export const Logo = ({
  signupData,
  handleProfileClick,
}: {
  signupData: any;
  handleProfileClick: () => void;
}) => (
  <div className="flex items-center space-x-2 py-1 text-sm font-normal text-black cursor-pointer">
    <div className="relative w-10 h-10" onClick={handleProfileClick}>
      <img
        src={(signupData?.profilePic as string) ?? ProfileP}
        alt="Profile"
        className="w-10 h-10 rounded-full relative z-10"
      />
      <div className="absolute inset-0.5 bg-red-500 opacity-50 rounded-full blur-md"></div>
      {signupData?.premium !== "Free" && (
        <span className="absolute -bottom-1 -right-1 bg-gray-950 text-yellow-400 text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center z-20">
          <Crown size={12} />
        </span>
      )}
    </div>

    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="font-medium whitespace-pre text-black dark:text-white"
    >
      <span className="text-white font-semibold text-base truncate">
        &nbsp;
        {signupData?.username}
      </span>
    </motion.span>
  </div>
);

export const LogoIcon = ({
  signupData,
  handleProfileClick,
}: {
  signupData: any;
  handleProfileClick: () => void;
}) => (
  <div className="relative w-10 h-10 cursor-pointer" onClick={handleProfileClick}>
    <img
      src={(signupData?.profilePic as string) ?? ProfileP}
      alt="Profile"
      className="w-10 h-10 rounded-full relative z-10"
    />
    <div className="absolute inset-0.5 bg-red-500 opacity-50 rounded-full blur-md"></div>
    {signupData?.premium !== "Free" && (
      <span className="absolute -bottom-1 -right-1 bg-black text-yellow-400 text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center z-20">
        <Crown size={12} />
      </span>
    )}
  </div>
);