"use client"

import { useState } from "react"
import { User, Settings, Music, Bell } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Label } from "recharts"

import Sidebar from "./userComponents/SideBar"

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false)
    const [profileImage, setProfileImage] = useState("/placeholder.svg?height=128&width=128")
  
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] // Safely access the file
      if (file) {
        const reader = new FileReader() // Create a new FileReader
        reader.onloadend = () => {
          setProfileImage(reader.result as string) // Set the profile image
        }
        reader.readAsDataURL(file) // Read the file as a data URL
      }
    }
  
    const handleAvatarClick = () => {
      const fileInput = document.getElementById("avatarUpload") as HTMLInputElement | null // Safely cast the element
      if (fileInput) {
        fileInput.click() // Trigger file input click
      }
    }
  
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto py-10 ml-64"> {/* Apply margin to avoid overlap with sidebar */}
          <h1 className="text-3xl font-bold mb-6">Profile Details</h1>
          <div className="grid grid-cols-[300px_1fr] gap-6"> {/* Adjust grid to avoid overlap */}
            
            {/* Aside Component on the Left */}
            <Sidebar/>
            
            <div className="flex max-w-fit">
              <Card className="bg-zinc-900 text-white border-zinc-700">
                <CardHeader>
                  <CardTitle>User Profile</CardTitle>
                  <p className="text-zinc-400">Manage your profile information</p>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="h-32 w-32 mb-4">
                    <img src={profileImage} alt="User Avatar" className="rounded-full" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="avatarUpload"
                  />
                  <Button variant="outline" className="w-full mb-4" onClick={handleAvatarClick}>
                    Change Avatar
                  </Button>
                  <div className="w-full space-y-2">
                    <Button variant="ghost" className="w-full justify-start text-white hover:text-white hover:bg-zinc-800">
                      <User className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-white hover:text-white hover:bg-zinc-800">
                      <Settings className="mr-2 h-4 w-4" />
                      Account Settings
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-white hover:text-white hover:bg-zinc-800">
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-white hover:text-white hover:bg-zinc-800">
                      <Music className="mr-2 h-4 w-4" />
                      Listening History
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900 text-white border-zinc-700">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Personal Information</CardTitle>
                    <Button onClick={() => setIsEditing(!isEditing)} variant="outline">
                      {isEditing ? "Save Changes" : "Edit Profile"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <input
                          id="firstName"
                          defaultValue="John"
                          disabled={!isEditing}
                          className="bg-zinc-800 text-white border-zinc-700 p-2 rounded"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <input
                          id="lastName"
                          defaultValue="Doe"
                          disabled={!isEditing}
                          className="bg-zinc-800 text-white border-zinc-700 p-2 rounded"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <input
                        id="email"
                        type="email"
                        defaultValue="john.doe@example.com"
                        disabled={!isEditing}
                        className="bg-zinc-800 text-white border-zinc-700 p-2 rounded"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Bio</Label>
                      <textarea
                        id="bio"
                        defaultValue="Music enthusiast and aspiring artist."
                        disabled={!isEditing}
                        className="bg-zinc-800 text-white border-zinc-700 p-2 rounded"
                      />
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
