"use client";

import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Table, TableHead, TableRow, TableCell, TableBody } from "../../components/ui/table";
import { Eye, Ban, CheckCircle } from "lucide-react";
import profileImg from "../../assets/profile6.jpeg";
import Sidebar from "./adminComponents/aside-side";
import { motion } from "framer-motion";
import { fetchArtists, toggleBlockArtist, Artist } from "../../services/adminService"; // Adjust path

export default function ArtistList() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArtists = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setError("No admin token found");
        return;
      }

      try {
        const artistData = await fetchArtists(token);
        setArtists(artistData);
        console.log(artistData, "sasd");
      } catch (error: any) {
        console.error(error);
        setError(error.message || "Failed to fetch artists");
      }
    };

    loadArtists();
  }, []);

  const handleToggleBlockArtist = async (id: string, currentStatus: boolean) => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setError("No admin token found");
      return;
    }

    try {
      const newStatus = await toggleBlockArtist(id, currentStatus, token);
      setArtists(artists.map((artist) =>
        artist.id === id ? { ...artist, isActive: newStatus } : artist
      ));
    } catch (error: any) {
      console.error("Error toggling block status:", error);
      setError(error.message || "Failed to update artist status");
    }
  };

  if (error) return <div>{error}</div>;

  return (
    <div className="flex">
      <Sidebar />
      <div className="min-h-screen p-6 ml-64 w-[calc(100%-16rem)] max-w-full">
        <h1 className="text-2xl font-bold mb-4">Artists</h1>
        <Card className="p-4 w-full">
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
                  <TableCell className="flex items-center gap-4 p-4">
                    <img
                      src={artist.image || profileImg}
                      alt={artist.name}
                      width={50}
                      height={50}
                      className="rounded-full object-cover"
                    />
                    <span className="font-medium">{artist.name}</span>
                  </TableCell>
                  <TableCell className="p-4">{artist.role}</TableCell>
                  <TableCell className="p-4">
                    <motion.span
                      className={`blur relative px-6 py-2 text-sm font-semibold text-white shadow transition-all duration-300 ease-in-out ${
                        artist.isActive
                          ? "bg-green-900/70 shadow-green-500/50 hover:bg-green-700"
                          : "bg-red-900/70 shadow-red-500/50 hover:bg-red-700"
                      }`}
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
                    <Button
                      size="sm"
                      variant={artist.isActive ? "destructive" : "outline"}
                      onClick={() => handleToggleBlockArtist(artist.id, artist.isActive)}
                      className="flex items-center gap-1"
                    >
                      {artist.isActive ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      {artist.isActive ? "Block" : "Unblock"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}