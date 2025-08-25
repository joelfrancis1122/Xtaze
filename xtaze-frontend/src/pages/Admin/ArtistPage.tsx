
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Table, TableHead, TableRow, TableCell, TableBody } from "../../components/ui/table";
import { Ban, CheckCircle } from "lucide-react";
import profileImg from "../../assets/profile4.jpeg";
import Sidebar from "./adminComponents/aside-side";
import { motion } from "framer-motion";
import { fetchArtists, toggleBlockArtist, } from "../../services/adminService";
import { Artist } from "../User/types/IArtist";

export default function ArtistList() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [error, setError] = useState<string | null>(null);
 const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
 

  useEffect(() => {
  const loadArtists = async () => {
    try {
      const res = await fetchArtists(page, 10);
      console.log(res,"lat")
      setArtists(res.data);        
      setTotalPages(res.pagination.totalPages);
    } catch (error: any) {
      console.error("Error fetching artists:", error);
      setError(error.message || "Failed to fetch artists");
    }
  };

  loadArtists();
}, [page]);


  const handleToggleBlockArtist = async (id: string, currentStatus: boolean) => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setError("No admin token found");
      return;
    }

    try {
      const newStatus = await toggleBlockArtist(id, currentStatus);
      setArtists(artists.map((artist) =>
        artist.id === id ? { ...artist, isActive: newStatus } : artist
      ));
    } catch (error: any) {
      console.error("Error toggling block status:", error);
      setError(error.message || "Failed to update artist status");
    }
  };

  if (error) return <div>{error}</div>;

  // Removed duplicate setPage function to resolve identifier conflict.

  return (
    <div className="flex">
      <Sidebar />
      <div className="min-h-screen p-6 ml-64 w-[calc(100%-16rem)] max-w-full">
        <h1 className="text-2xl font-bold mb-4">Artists</h1>
        <Card className="p-4 w-full">
          <Table className="w-full">
  <TableHead>
    <TableRow>
      <th className="text-left p-4 min-w-[200px] font-semibold">Client</th>
      <th className="text-left p-4 min-w-[150px] font-semibold">Role</th>
      <th className="text-left p-4 min-w-[100px] font-semibold">Status</th>
      <th className="text-left p-4 min-w-[200px] font-semibold">Actions</th>
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
            {artist.isActive ? "O" : "O"}
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

              <div className="flex justify-between items-center mt-4">
            <Button
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="px-4 py-2 bg-[#2f2f2f] hover:bg-black"
            >
              Previous
            </Button>

            <span className="text-gray-400">
              Page {page} of {totalPages}
            </span>

            <Button
              disabled={page === totalPages}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              className=" mr-55 px-6 py-2 bg-[#2f2f2f] hover:bg-black"
            >
              Next
            </Button>
          </div>

        </Card>
      </div>
    </div>
  );
}