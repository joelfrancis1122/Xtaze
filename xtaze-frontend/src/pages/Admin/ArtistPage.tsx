"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Button } from "../../components/ui/button"
import { Card } from "../../components/ui/card"
import { Table, TableHead, TableRow, TableCell, TableBody } from "../../components/ui/table"
import { Eye, Ban, CheckCircle } from "lucide-react"
import profileImg from "../../assets/profile6.jpeg" // You can replace this with the actual fetched images.
import Sidebar from "./adminComponents/aside-side"
import { motion } from "framer-motion";

interface Artist {
    id: string  // Changed to string if you're using MongoDB (_id is a string)
    name: string
    role: string
    image: string
    isActive: boolean 
}

export default function ArtistList() {
    const [artists, setArtists] = useState<Artist[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const baseUrl = import.meta.env.VITE_BASE_URL;
    useEffect(() => {
        const fetchArtists = async () => {
            const token = localStorage.getItem("adminToken"); 
            try {
                const response = await axios.get(`${baseUrl}/admin/listUsers`,{
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                }) // Adjust the endpoint
                const artistData = response.data.data.map((artist: any) => ({
                    id: artist._id,
                    name: artist.username,
                    role: artist.role,
                    image: artist.profilePic || profileImg,
                    isActive: artist.isActive ? true : false,
                }))
                setArtists(artistData)
                console.log(artistData, "sasd")
            } catch (error: any) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }

        fetchArtists()
    }, [])

    const toggleBlockArtist = async (id: string, currentStatus: boolean) => {
        try {
            console.log(currentStatus, "s")
            // Making an Axios request to toggle the artist's block status
            const newStatus = currentStatus === true ? false : true
            await axios.patch(`${baseUrl}/admin/toggleBlock/${id}`, { status: newStatus })
            setArtists(artists.map((artist) =>
                artist.id === id ? { ...artist, isActive: newStatus } : artist
            ))
        } catch (error) {
            console.error("Error toggling block status:", error)
            setError("Failed to update artist status")
        }
    }

    if (error) return <div>{error}</div>

    return (
        <div className="flex">
            <Sidebar />

            <div className="min-h-screen p-6 ml-64 w-[calc(100%-16rem)] max-w-full">
                <h1 className="text-2xl font-bold mb-4">Artists</h1>
                <Card className="p-4 w-full"> {/* Ensure full width */}
                    <Table className="w-full">
                        <TableHead>
                            <TableRow>
                                <TableCell className="text-left p-4 min-w-[200px]">Artist</TableCell>
                                <TableCell className="text-left p-4 min-w-[150px]">Role</TableCell>
                                <TableCell className="text-left p-4 min-w-[150px]">Status</TableCell>
                                <TableCell className="text-left p-4 min-w-[200px]">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {artists.map((artist) => (
                                <TableRow key={artist.id} className="border-b">
                                    {/* Artist Image & Name */}
                                    <TableCell className="flex items-center gap-4 p-4">
                                        <img src={artist.image} alt={artist.name} width={50} height={50} className="rounded-full object-cover" />
                                        <span className="font-medium">{artist.name}</span>
                                    </TableCell>

                                    <TableCell className="p-4">{artist.role}</TableCell>
                                    <TableCell className="p-4">
                                        <motion.span
                                            className={` blur relative px-6 py-2 text-sm font-semibold text-white shadow transition-all duration-300 ease-in-out
                                         ${artist.isActive ? "bg-green-900/70 shadow-green-500/50 hover:bg-green-700" : "bg-red-900/70 shadow-red-500/50 hover:bg-red-700"}`}  
                                            style={{
                                                borderRadius: "50%", 
                                                paddingLeft: "15px",
                                                paddingRight: "15px",
                                                paddingTop: "10px",
                                                paddingBottom: "10px",
                                                display: "inline-block",
                                                backdropFilter: "blur(1px)",  
                                            }}
                                        >
                                            {artist.isActive ? "O" : "O "}
                                        </motion.span>



                                    </TableCell>



                                    <TableCell className="p-4 w-[100px] flex justify-center gap-3" style={{ transform: "translateY(-10px)" }}>
                                    {/* <Button size="sm" variant="outline" className="flex items-center gap-1">
                                            <Eye className="h-4 w-4" /> View
                                        </Button> */}

                                        <Button
                                            size="sm"
                                            variant={artist.isActive === true ? "destructive" : "outline"}
                                            onClick={() => toggleBlockArtist(artist.id, artist.isActive)}
                                            className="flex items-center gap-1"
                                        >
                                            {artist.isActive === true ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                            {artist.isActive === true ? "Block" : "Unblock"}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    )
}
