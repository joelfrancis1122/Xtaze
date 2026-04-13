
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
// import { Table, TableRow, TableCell, TableBody, TableHead } from "../../components/ui/table";
import { Ban, CheckCircle, Plus, Edit, Save } from "lucide-react";
import Sidebar from "./adminComponents/aside-side";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { fetchGenres, addGenre, toggleBlockGenre, updateGenre } from "../../services/adminService";
import { Table, TableBody } from "../../components/ui/table";

interface Genre {
  id: string;
  name: string;
  isBlocked: boolean;
}

export default function GenreManagement() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [newGenre, setNewGenre] = useState<string>("");
  const [editingGenreId, setEditingGenreId] = useState<string | null>(null);
  const [editedGenreName, setEditedGenreName] = useState<string>("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // useEffect(() => {
  //   fetchGenres()
  //     .then((genres) => setGenres(genres))
  //     .catch((err) => console.error("Error fetching genres:", err));
  // }, []);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchGenres(page, 10);

        setGenres(res.data);

        setTotalPages(res.pagination.totalPages);
      } catch (err) {
        console.error("Error fetching genres:", err);
      }
    };

    fetchData();
  }, [page]);
  // const handleDeleteGenre = async (id: string) => {
  //   try {
  //     await deleteGenre(id);
  //     setGenres((prevGenres) => prevGenres.filter((genre) => genre.id !== id));
  //     toast.success("Genre deleted successfully!");
  //   } catch (error) {
  //     console.error("Error deleting genre:", error);
  //     toast.error("Failed to delete genre. Please try again.");
  //   }
  // };


  const handleAddGenre = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newGenre.trim()) return;

    try {
      const addedGenre = await addGenre(newGenre.toLowerCase());
      setGenres([addedGenre, ...genres]);
      setNewGenre("");
      toast.success("Genre added successfully!");
    } catch (error: any) {
      if (error.response?.status === 400) {
        toast.error(error.response.data.message);
        return;
      }
      toast.error("Something went wrong. Please try again.");
      console.error("Error adding genre:", error);
    }
  };

  const toggleBlockGenreHandler = async (id: string) => {
    try {
      setGenres((prevGenres) =>
        prevGenres.map((genre) =>
          genre.id === id ? { ...genre, isBlocked: !genre.isBlocked } : genre
        )
      );
      await toggleBlockGenre(id);
      toast.success("Genre status updated successfully!");
    } catch (error) {
      console.error("Error updating genre status:", error);
      toast.error("Failed to update genre status. Please try again.");
    }
  };

  const handleEditClick = (genre: Genre) => {
    setEditingGenreId(genre.id);
    setEditedGenreName(genre.name);
  };

  const handleSaveEdit = async (event: React.FormEvent, id: string) => {
    event.preventDefault();
    if (!editedGenreName.trim()) {
      toast.error("Input is empty!");
      return;
    }
    try {
      const result = await updateGenre(id, editedGenreName.trim().toLowerCase());
      if (result.success) {
        setGenres((prevGenres) =>
          prevGenres.map((genre) =>
            genre.id === id ? { ...genre, name: editedGenreName.trim().toLowerCase() } : genre
          )
        );
        setEditingGenreId(null);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error updating genre:", error);
      toast.error("Failed to update genre. Please try again.");
    }
  };

  return (
    // Same JSX as before, unchanged
    <div className="flex bg-background text-white min-h-screen">
      <Sidebar />
      <div className="p-6 ml-64 w-[calc(100%-16rem)] max-w-full">
        <h1 className="text-2xl font-bold mb-4">Genre Management</h1>
        <Card className="p-4 w-full bg- var(--foreground) !important; text-white shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Create New Genre</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter genre name"
              value={newGenre}
              onChange={(e) => {
                if (e.target.value.length <= 15) {

                  setNewGenre(e.target.value.trim())
                }
              }}
              className="border p-2 rounded-md w-full bg-[#111111] border-gray-600 text-white"
            />
            <Button onClick={handleAddGenre} className="bg-[#2f2f2f] hover:bg-black">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </Card>
        <Card className="mt-6 p-4 w-full bg- var(--foreground) !important; text-white shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Genre List</h2>
          <Table className="w-full">
  <thead>
    <tr className="bg- var(--foreground) !important;">
      <th className="text-left p-4">Genre Name</th>
      <th className="text-left p-4">Status</th>
      <th className="text-center p-3"></th>
      <th className="text-center p-2">Actions</th>
    </tr>
  </thead>
  <TableBody>
    {genres.map((genre) => (
      <tr key={genre.id} className="border-b h-16 hover:bg-[#2f2f2f]">
        <td className="p-4 flex items-center gap-2">
          {editingGenreId === genre.id ? (
            <input
              type="text"
              value={editedGenreName}
              onChange={(e) => {
                if (e.target.value.length <= 15) {
                  setEditedGenreName(e.target.value.trim());
                }
              }}
              className="border p-2 rounded-md w-[200px] bg-[#222222] border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-white-500"
            />
          ) : (
            <span className="truncate">{genre.name}</span>
          )}
        </td>
        <td className="p-4 w-[120px] text-center">
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
        </td>
        <td className="p-4 w-[250px] flex justify-center gap-2">
          {editingGenreId === genre.id ? (
            <Button
              size="sm"
              onClick={(e) => handleSaveEdit(e, genre.id)}
              className="flex items-center gap-1 w-[80px] justify-center bg- var(--foreground) hover:bg- var(--foreground)"
            >
              <Save className="h-4 w-4" /> Save
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => handleEditClick(genre)}
              className="flex items-center gap-1 w-[80px] justify-center bg- var(--foreground) hover:bg- var(--foreground)"
            >
              <Edit className="h-4 w-4" /> Edit
            </Button>
          )}
        </td>
        <td className="p-4 w-[250px]">
          <div className="flex justify-center items-center gap-2">
            <Button
              size="sm"
              variant={genre.isBlocked ? "outline" : "destructive"}
              onClick={() => toggleBlockGenreHandler(genre.id)}
              className="flex items-center gap-1 w-[110px] justify-center whitespace-nowrap h-[32px]"
            >
              {genre.isBlocked ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
              <span className="w-[60px] text-center">{genre.isBlocked ? "Unblock" : "Block"}</span>
            </Button>
          </div>
        </td>
      </tr>
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
              className=" mr-35 px-6 py-2 bg-[#2f2f2f] hover:bg-black"
            >
              Next
            </Button>
          </div>

        </Card>
      </div>
    </div>
  );
}