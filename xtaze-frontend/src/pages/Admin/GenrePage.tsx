"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Table, TableRow, TableCell, TableBody, TableHead } from "../../components/ui/table";
import { Ban, CheckCircle, Plus, Edit, Save } from "lucide-react";
import Sidebar from "./adminComponents/aside-side";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Genre {
  _id: string;
  name: string;
  isBlocked: boolean;
}

export default function GenreManagement() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [newGenre, setNewGenre] = useState<string>("");
  const [editingGenreId, setEditingGenreId] = useState<string | null>(null);
  const [editedGenreName, setEditedGenreName] = useState<string>("");

  const token = localStorage.getItem("adminToken");
  useEffect(() => {

    axios.get("http://localhost:3000/admin/genreList", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => setGenres(res.data.data))
      .catch((err) => console.error("Error fetching genres:", err));
  }, [])

  const handleAddGenre = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!newGenre.trim()) return;

    try {
      const res = await axios.post(
        "http://localhost:3000/admin/genreCreate",
        { name: newGenre.toLowerCase() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(res.data, "odi odioi")
      setGenres([res.data.data, ...genres]);
      setNewGenre("");
      toast.success(res.data.message);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 400) {
          toast.error(error.response.data.message);
          return;
        }
      }
      toast.error("Something went wrong. Please try again.");
      console.error("Error adding genre:", error);
    }
  };



  const toggleBlockGenre = async (id: string) => {
    try {
      setGenres((prevGenres) =>
        prevGenres.map((genre) =>
          genre._id === id ? { ...genre, isBlocked: !genre.isBlocked } : genre
        )
      );

      await axios.put(
        `http://localhost:3000/admin/genreToggleBlockUnblock/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Genre status updated successfully!");
    } catch (error) {
      console.error("Error updating genre status:", error);
      toast.error("Failed to update genre status. Please try again.");
    }
  };

  const handleEditClick = (genre: Genre) => {
    setEditingGenreId(genre._id);
    setEditedGenreName(genre.name);
  };

  const handleSaveEdit = async (event: React.FormEvent, id: string) => {
    try {
      if (editedGenreName.trim().length == 0) {
        toast.error("input is empty !")
        event.preventDefault();
        return
      }
      const response = await axios.put(
        `http://localhost:3000/admin/genreUpdate/${id}`,
        { name: editedGenreName.trim().toLowerCase() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ); setGenres((prevGenres) =>
        prevGenres.map((genre) =>
          genre._id === id ? { ...genre, name: editedGenreName } : genre
        )
      );
      if (response.data.data.success == true) {
        console.log(response.data.data.success == true)
        setEditingGenreId(null);
        toast.success(response?.data.data.message);
      } else {
        event.preventDefault()
        toast.success(response?.data?.data.message);

      }
    } catch (error) {
      console.error("Error updating genre:", error);
      toast.error("Failed to update genre. Please try again.");
    }
  };

  return (
    <div className="flex bg-background text-white min-h-screen">
      <Sidebar />
      <div className="p-6 ml-64 w-[calc(100%-16rem)] max-w-full">
        <h1 className="text-2xl font-bold mb-4">Genre Management</h1>

        {/* Create Genre Section */}
        <Card className="p-4 w-full bg- var(--foreground) !important; text-white shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Create New Genre</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter genre name"
              value={newGenre}
              onChange={(e) => setNewGenre(e.target.value)}
              className="border p-2 rounded-md w-full bg-[#111111] border-gray-600 text-white"
            />
            <Button onClick={handleAddGenre} className="bg-[#2f2f2f] hover:bg-black">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </Card>

        {/* Genre List Section */}
        <Card className="mt-6 p-4 w-full bg- var(--foreground) !important; text-white shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Genre List</h2>
          <Table className="w-full">
            <TableHead>
              <TableRow className="bg- var(--foreground) !important;">
                <TableCell className="text-left p-4 mt-7">Genre Name</TableCell>
                <TableCell className="text-left p-4 ">Status</TableCell>
                <TableCell className="text-left p-4 "></TableCell>
                <TableCell className="text-left p-4 ">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {genres.map((genre) => (
                <TableRow key={genre._id} className="border-b h-16 hover:bg-[#2f2f2f]">
                  <TableCell className="p-4 flex items-center gap-2">
                    {editingGenreId === genre._id ? (
                      <input
                        type="text"
                        value={editedGenreName}
                        onChange={(e) => setEditedGenreName(e.target.value)}
                        className="border p-2 rounded-md w-[200px] bg-[#222222] border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-white-500"
                      />
                    ) : (
                      <span className="truncate">{genre.name}</span>
                    )}
                  </TableCell>
                  <TableCell className="p-4 w-[120px] text-center">
                    <motion.span
                      className={`blur relative px-6 py-2 text-sm font-semibold text-white shadow transition-all duration-300 ease-in-out
                    ${genre.isBlocked ? "bg-red-900/70 shadow-red-500/50 hover:bg-red-700" : "bg-green-900/70 shadow-green-500/50 hover:bg-green-700"}`}
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
                      {genre.isBlocked ? "O" : "O"}
                    </motion.span>
                  </TableCell>

                  <TableCell className="p-4 w-[250px] flex justify-center gap-2">
                    {editingGenreId === genre._id ? (
                      <Button
                        size="sm"
                        onClick={(e) => handleSaveEdit(e, genre._id)}
                        className="flex items-center gap-1 w-[80px] justify-center bg-g var(--foreground) !important; hover:bg- var(--foreground) !important;-700"
                      >
                        <Save className="h-4 w-4" /> Save
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleEditClick(genre)}
                        className="flex items-center gap-1 w-[80px] justify-center bg- var(--foreground) !important; hover:bg- var(--foreground) !important"
                      >
                        <Edit className="h-4 w-4" /> Edit
                      </Button>
                    )}

                  </TableCell>

                  <TableCell className="p-4 w-[250px]  justify-center gap-2">

                    <Button
                      size="sm"
                      variant={genre.isBlocked ? "outline" : "destructive"}
                      onClick={() => toggleBlockGenre(genre._id)}
                      className="flex items-center gap-1 w-[110px] justify-center whitespace-nowrap h-[32px]"
                    >
                      {genre.isBlocked ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                      <span className="w-[60px] text-center">{genre.isBlocked ? "Unblock" : "Block"}</span>
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
