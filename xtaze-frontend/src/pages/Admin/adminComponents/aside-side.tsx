"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom" // ✅ React Router navigation
import { Button } from "../../../components/ui/button"
import { LayoutDashboard, Mic2, Music, Settings, Video, Image, PieChart, Headphones, Menu, LogOut,BadgePercent, Gem, BadgeDollarSign, History } from "lucide-react" // Add LogOut icon
import { useDispatch } from "react-redux"
import { clearAdminData } from "../../../redux/adminSlice"
export default function Sidebar() {
  useEffect(() => {
    const styles = `
      body, * {
        color: var(--foreground) !important; /* White text */
      }
    `;
    const styleSheet = document.createElement("style")
    styleSheet.type = "text/css"
    styleSheet.innerText = styles
    document.head.appendChild(styleSheet)

    return () => {
      document.head.removeChild(styleSheet) // Cleanup on unmount
    }
  }, [])

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const navigate = useNavigate() 
  const dispatch = useDispatch()
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
    { icon: Mic2, label: "Users", path: "/admin/artists" },
    { icon: Music, label: "Genre", path: "/admin/genre" }, 
    { icon: BadgeDollarSign , label: "Monetization", path: "/admin/monetization" },
    { icon: Image, label: "Banner", path: "/admin/banner" },
    { icon: PieChart, label: "Analytics", path: "/admin/analytics" },
    { icon: BadgePercent, label: "Coupons", path: "/admin/coupons" },
    { icon: Gem, label: "Subscriptions", path: "/admin/subscriptions" },
    { icon: History, label: "History", path: "/admin/history" },
  ]

  // Handle logout
  const handleLogout = () => {
    // Clear user-related data (e.g., JWT token, user data)
    localStorage.removeItem("adminToken");
            dispatch(clearAdminData())
    
    navigate("/admin") // Redirect to login page after logout
  
  }

  return (
    <>
      {/* Sidebar */}
     <aside className=" top-0 left-0 z-50 w-64 h-full border-r bg-background/95 backdrop-blur fixed">
  <div className="flex h-16 items-center gap-2 border-b px-6">
    <Headphones className="h-6 w-6 text-primary" />
    <span className="font-bold text-xl">Xtaze</span>
  </div>
  <nav className="space-y-2 px-2 py-4">
    {menuItems.map((item, index) => (
      <Button
        key={index}
        variant="ghost"
        className="w-full justify-start gap-2"
        onClick={() => navigate(item.path)}
      >
        <item.icon className="h-4 w-4" />
        {item.label}
      </Button>
    ))}
  </nav>

  {/* Logout Button */}
  <div className="absolute bottom-4 w-full px-2">
    <Button
      variant="ghost"
      className="w-full justify-start gap-2"
      onClick={handleLogout}
    >
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  </div>
</aside>


      {/* Sidebar Toggle Button (for mobile) */}
      <Button
        variant="ghost"
        className="lg:hidden absolute top-4 left-4"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu className="h-6 w-6" />
      </Button>
    </>
  )
}
