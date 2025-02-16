"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Table, TableRow, TableCell, TableBody } from "../../components/ui/table";
import { Ban, CheckCircle, Plus, Edit, Save } from "lucide-react";
import Sidebar from "./adminComponents/aside-side";
import { toast } from "sonner";

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

  useEffect(() => {
    const token = localStorage.getItem("token"); // Get the token from localStorage

    axios.get("http://localhost:3000/admin/genreList", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setGenres(res.data.data))
      .catch((err) => console.error("Error fetching genres:", err));
  }, [])

  const handleAddGenre = async () => {
    if (newGenre.trim()) {
      try {
        const res = await axios.post("http://localhost:3000/admin/genreCreate", { name: newGenre });
        setGenres([res.data.data, ...genres]);
        setNewGenre("");
      } catch (err) {
        console.error("Error adding genre:", err);
      }
    }
  };

  const toggleBlockGenre = async (id: string) => {
    try {
      setGenres((prevGenres) =>
        prevGenres.map((genre) =>
          genre._id === id ? { ...genre, isBlocked: !genre.isBlocked } : genre
        )
      );

      await axios.put(`http://localhost:3000/admin/genreToggleBlockUnblock/${id}`);
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
      await axios.put(`http://localhost:3000/admin/genreUpdate/${id}`, { name: editedGenreName });
      setGenres((prevGenres) =>
        prevGenres.map((genre) =>
          genre._id === id ? { ...genre, name: editedGenreName } : genre
        )
      );

      setEditingGenreId(null);
      toast.success("Genre updated successfully!");
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
            <thead>
              <TableRow className="bg- var(--foreground) !important;">
                <th className="text-left p-4 min-w-[200px]">Genre Name</th>
                <th className="text-left p-4 min-w-[150px]">Status</th>
                <th className="text-left p-4 min-w-[250px]">Actions</th>
              </TableRow>
            </thead>
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
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full w-[90px] h-[32px] flex items-center justify-center ${genre.isBlocked ? "bg- var(--foreground) !important; text-white" : "bg- var(--foreground) !important; text-white"}`}>
                      {genre.isBlocked ? "Blocked" : "Active"}
                    </span>
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
