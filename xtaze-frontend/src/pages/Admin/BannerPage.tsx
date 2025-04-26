
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store"; // Adjust path
import { Trash2, Edit, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import Sidebar from "./adminComponents/aside-side";
import { createBanner, deleteBanner, fetchBanners, updateBanner } from "../../services/adminService";
import { IBanner } from "../User/types/IBanner";

interface UserSignupData {
  _id?: string;
  role?: string;
}

export default function AdminBannerManagement() {
  const user = useSelector((state: RootState) => state.user.signupData) as UserSignupData | null;
  const [banners, setBanners] = useState<IBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBanner, setNewBanner] = useState<Partial<IBanner & { file?: File }>>({
    title: "",
    description: "",
    action: "/discover",
    isActive: true,
  });
  const [editingBanner, setEditingBanner] = useState<IBanner | null>(null);
  const [editingFile, setEditingFile] = useState<File | null>(null);

  // Check if user is admin

  // Fetch banners
  useEffect(() => {
    const loadBanners = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) throw new Error("No token found");
        const fetchedBanners = await fetchBanners(token);
        setBanners(fetchedBanners);
      } catch (error) {
        console.error("Error fetching banners:", error);
        toast.error("Failed to load banners");
      } finally {
        setLoading(false);
      }
    };
    loadBanners();
  }, []);

  // Create banner
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      if (!token || !user?._id) throw new Error("Authentication required");
      const createdBanner = await createBanner(
        {
          title: newBanner.title || "",
          description: newBanner.description || "",
          file: newBanner.file,
          action: newBanner.action || "/discover",
          isActive: newBanner.isActive ?? true,
          createdBy: user._id,
        },
        token
      );
      setBanners([...banners, createdBanner]);
      setNewBanner({ title: "", description: "", action: "/discover", isActive: true });
      toast.success("Banner created successfully");
    } catch (error) {
      console.error("Error creating banner:", error);
      toast.error("Failed to create banner");
    }
  };

  // Update banner
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) throw new Error("Authentication required");
      const updatedBanner = await updateBanner(
        editingBanner._id,
        {
          title: editingBanner.title,
          description: editingBanner.description,
          file: editingFile || undefined,
          action: editingBanner.action,
          isActive: editingBanner.isActive,
        },
        token
      );
      setBanners(banners.map(b => (b._id === updatedBanner._id ? updatedBanner : b)));
      setEditingBanner(null);
      setEditingFile(null);
      toast.success("Banner updated successfully");
    } catch (error) {
      console.error("Error updating banner:", error);
      toast.error("Failed to update banner");
    }
  };

  // Delete banner
  const handleDelete = async (_id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) throw new Error("Authentication required");
      await deleteBanner(_id, token);
      setBanners(banners.filter(b => b._id !== _id));
      toast.success("Banner deleted successfully");
    } catch (error) {
      console.error("Error deleting banner:", error);
      toast.error("Failed to delete banner");
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <div className="flex-1 ml-64 p-6">
        <h1 className="text-3xl font-bold mb-6">Banner Management</h1>

        {/* Create Banner Form */}
        <form onSubmit={handleCreate} className="mb-8 bg-black-900 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Add New Banner</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Title"
              value={newBanner.title}
              onChange={e => setNewBanner({ ...newBanner, title: e.target.value })}
              className="p-2 bg-gray-800 rounded border border-gray-600"
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={newBanner.description}
              onChange={e => setNewBanner({ ...newBanner, description: e.target.value })}
              className="p-2 bg-gray-800 rounded border border-gray-600"
              required
            />
            <input
              type="file"
              accept="image/*"
              onChange={e => setNewBanner({ ...newBanner, file: e.target.files?.[0] || undefined })}
              className="p-2 bg-gray-800 rounded border border-gray-600 text-gray-400"
            />
            {/* <select
              value={newBanner.action}
              onChange={e => setNewBanner({ ...newBanner, action: e.target.value })}
              className="p-2 bg-gray-800 rounded border border-gray-600"
            >
              <option value="/discover">Discover</option>
              <option value="/plans">Plans</option>
              <option value="play-featured">Play Featured</option>
            </select> */}
          </div>
          <button
            type="submit"
            className="mt-4 bg-gray-800 hover:bg-black-700 text-white p-2 rounded flex items-center gap-2"
          >
            <Plus size={20} /> Add Banner
          </button>
        </form>

        {/* Banner List */}
        <div className="bg-black-900 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Existing Banners</h2>
          {loading ? (
            <p>Loading...</p>
          ) : banners.length === 0 ? (
            <p>No banners found.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="p-2">ID</th>
                  <th className="p-2">Title</th>
                  <th className="p-2">Description</th>
                  <th className="p-2">Image</th>
                  <th className="p-2">Active</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {banners.map(banner => (
                  <tr key={banner._id} className="border-b border-gray-600">
                    <td className="p-2">{banner._id}</td>
                    <td className="p-2">{banner.title}</td>
                    <td className="p-2">{banner.description}</td>
                    <td className="p-2">
                      {banner.imageUrl ? (
                        <img src={banner.imageUrl} alt={banner.title} className="w-16 h-16 object-cover rounded" />
                      ) : (
                        "No Image"
                      )}
                    </td>
                    <td className="p-2">{banner.isActive ? "Yes" : "No"}</td>
                    <td className="p-2 flex gap-2">
                      <button
                        onClick={() => setEditingBanner(banner)}
                        className="p-1 bg-yellow-600 hover:bg-yellow-700 rounded"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(banner._id)}
                        className="p-1 bg-red-600 hover:bg-red-700 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Edit Banner Modal */}
        {editingBanner && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <form onSubmit={handleUpdate} className="bg-gray-900 p-6 rounded-lg border border-gray-700 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Edit Banner</h2>
              <input
                type="text"
                placeholder="Title"
                value={editingBanner.title}
                onChange={e => setEditingBanner({ ...editingBanner, title: e.target.value })}
                className="p-2 bg-gray-800 rounded border border-gray-600 w-full mb-4"
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={editingBanner.description}
                onChange={e => setEditingBanner({ ...editingBanner, description: e.target.value })}
                className="p-2 bg-gray-800 rounded border border-gray-600 w-full mb-4"
                required
              />
              <input
                type="file"
                accept="image/*"
                onChange={e => setEditingFile(e.target.files?.[0] || null)}
                className="p-2 bg-gray-800 rounded border border-gray-600 w-full mb-4 text-gray-400"
                required
             />
              {editingBanner.imageUrl && !editingFile && (
                <img
                  src={editingBanner.imageUrl}
                  alt="Current banner"
                  className="w-32 h-32 object-cover rounded mb-4"
                />
              )}
              {/* <select
                value={editingBanner.action}
                onChange={e => setEditingBanner({ ...editingBanner, action: e.target.value })}
                className="p-2 bg-gray-800 rounded border border-gray-600 w-full mb-4"
              >
                <option value="/discover">Discover</option>
                <option value="/plans">Plans</option>
                <option value="play-featured">Play Featured</option>
              </select> */}
              {/* <select
                value={editingBanner.position}
                onChange={e => setEditingBanner({ ...editingBanner, position: e.target.value as "top" | "middle" | "bottom" })}
                className="p-2 bg-gray-800 rounded border border-gray-600 w-full mb-4"
              >
                <option value="top">Top</option>
                <option value="middle">Middle</option>
                <option value="bottom">Bottom</option>
              </select> */}
              <label className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={editingBanner.isActive}
                  onChange={e => setEditingBanner({ ...editingBanner, isActive: e.target.checked })}
                  className="h-4 w-4"
                />
                Active
              </label>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded flex items-center gap-2"
                >
                  <Save size={20} /> Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingBanner(null);
                    setEditingFile(null);
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}