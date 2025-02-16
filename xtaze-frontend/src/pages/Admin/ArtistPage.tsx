"use client"

import { useEffect, useState } from "react"
import { Button } from "../../components/ui/button"
import { Card } from "../../components/ui/card"
import { Table, TableHead, TableRow, TableCell, TableBody } from "../../components/ui/table"
import { Eye, Ban, CheckCircle } from "lucide-react"
import profileImg from "../../assets/spidey.jpeg"
import Sidebar from "./adminComponents/aside-side"

interface Artist {
    id: number
    name: string
    genre: string
    image: string
    status: "active" | "blocked"
}

export default function ArtistList() {
    const [artists, setArtists] = useState<Artist[]>([
        { id: 1, name: "The Weeknd", genre: "R&B", image: profileImg, status: "active" },
        { id: 2, name: "Billie Eilish", genre: "Pop", image: profileImg, status: "blocked" },
        { id: 3, name: "Eminem", genre: "Hip-Hop", image: profileImg, status: "active" },
    ])

    useEffect(() => {
        const styles = `
            body, * {
                color: var(--foreground) !important;
                background-color: var(--background) !important;
            }
        `
        const styleSheet = document.createElement("style")
        styleSheet.type = "text/css"
        styleSheet.innerText = styles
        document.head.appendChild(styleSheet)

        return () => {
            document.head.removeChild(styleSheet)
        }
    }, [])

    const toggleBlockArtist = (id: number) => {
        setArtists(artists.map((artist) =>
            artist.id === id ? { ...artist, status: artist.status === "active" ? "blocked" : "active" } : artist
        ))
    }

    return (
        <div className="flex">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="min-h-screen p-6 ml-64 w-[calc(100%-16rem)] max-w-full">
                <h1 className="text-2xl font-bold mb-4">Artists</h1>
                <Card className="p-4 w-full"> {/* Ensure full width */}
                    <Table className="w-full">
                        <TableHead>
                            <TableRow>
                                <TableCell className="text-left p-4 min-w-[200px]">Artist</TableCell>
                                <TableCell className="text-left p-4 min-w-[150px]">Genre</TableCell>
                                <TableCell className="text-left p-4 min-w-[150px]">Status</TableCell>
                                <TableCell className="text-left p-4 min-w-[200px]">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody className="p-4 overflow-x-auto">
                            {artists.map((artist) => (
                                <TableRow key={artist.id} className="border-b">
                                    {/* Artist Image & Name */}
                                    <TableCell className="flex items-center gap-4 p-4">
                                        <img src={artist.image} alt={artist.name} width={50} height={50} className="rounded-full object-cover" />
                                        <span className="font-medium">{artist.name}</span>
                                    </TableCell>

                                    {/* Genre */}
                                    <TableCell className="p-4">{artist.genre}</TableCell>

                                    {/* Status Indicator */}
                                    <TableCell className="p-4">
                                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${artist.status === "active" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                                            {artist.status === "active" ? "Active" : "Blocked"}
                                        </span>
                                    </TableCell>

                                    {/* Actions */}
                                   <TableCell className="p-4 w-[100px] flex justify-center">
                                        {/* View Profile */}
                                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                                            <Eye className="h-4 w-4" /> View
                                        </Button>

                                        {/* Block/Unblock Button */}
                                        <Button
                                            size="sm"
                                            variant={artist.status === "active" ? "destructive" : "outline"}
                                            onClick={() => toggleBlockArtist(artist.id)}
                                            className="flex items-center gap-1"
                                        >
                                            {artist.status === "active" ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                            {artist.status === "active" ? "Block" : "Unblock"}
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
