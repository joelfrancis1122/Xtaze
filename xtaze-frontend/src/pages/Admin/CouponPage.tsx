"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Sidebar from "./adminComponents/aside-side";
import axios from "axios";
import { Button } from "../../components/ui/button";

interface Coupon {
  _id: string; // Change to _id if backend uses this
  code: string;
  discountAmount: number;
  expires: string;
  maxUses: number;
  uses: number;
  status:string;
}

export default function AdminCouponPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountAmount: 0,
    expires: "",
    maxUses: 0,
  });
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  useEffect(() => {
    const styles = `
  body, * {
    background-color: var(--background) !important; /* Dark background */
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


  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await axios.get("http://localhost:3000/admin/coupons", {
          headers: { Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}` },
        });
        console.log("Fetched coupons:", response.data); // Debug
        setCoupons(response.data.data || []);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to fetch coupons");
      }
    };
    fetchCoupons();
  }, []);

  const validateCoupon = (coupon: typeof newCoupon) => {
    const newErrors: { [key: string]: string } = {};

    if (!coupon.code) newErrors.code = "Code is required";
    if (coupon.discountAmount < 0) newErrors.discountAmount = "Discount must be 0 or more";
    else if (coupon.discountAmount > 100) newErrors.discountAmount = "Discount cannot exceed 100%";
    if (!coupon.expires) newErrors.expires = "Date is required";
    else if (coupon.expires < new Date().toISOString().split("T")[0]) {
      newErrors.expires = "Date must be today or future";
    }
    if (coupon.maxUses < 0) newErrors.maxUses = "Max uses must be 0 or more";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof typeof newCoupon, value: any) => {
    const updatedCoupon = { ...newCoupon, [field]: value };
    setNewCoupon(updatedCoupon);
    validateCoupon(updatedCoupon);
  };

  const handleCreateCoupon = async () => {
    if (!validateCoupon(newCoupon)) {
      toast.error("Please fix the errors");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/admin/coupons",
        { ...newCoupon, uses: 0 },
        { headers: { Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}` } }
      );
      console.log("Created coupon:", response.data); // Debug
      const createdCoupon = response.data.result;
      setCoupons([...coupons, { ...createdCoupon, _id: createdCoupon._id }]); // Ensure _id
      setNewCoupon({ code: "", discountAmount: 0, expires: "", maxUses: 0 });
      setIsCreateFormOpen(false);
      setErrors({});
      toast.success("Coupon created successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create coupon");
    }
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setNewCoupon({
      code: coupon.code,
      discountAmount: coupon.discountAmount,
      expires: coupon.expires,
      maxUses: coupon.maxUses,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleUpdateCoupon = async () => {
    if (!editingCoupon || !validateCoupon(newCoupon)) {
      toast.error("Please fix the errors");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:3000/admin/coupons?id=${editingCoupon._id}`,
        { ...newCoupon },
        { headers: { Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}` } }
      );
      const updatedCoupon = response.data.data;
      setCoupons(coupons.map((c) => (c._id === editingCoupon._id ? updatedCoupon : c)));
      setEditingCoupon(null);
      setNewCoupon({ code: "", discountAmount: 0, expires: "", maxUses: 0 });
      setIsModalOpen(false);
      setErrors({});
      toast.success("Coupon updated successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update coupon");
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!id) {
      toast.error("Coupon ID is missing");
      return;
    }
    try {
      await axios.delete(`http://localhost:3000/admin/coupons?id=${id}`, { // Changed to path param
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}` },
      });
      setCoupons(coupons.filter((c) => c._id !== id));
      toast.success("Coupon deleted successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete coupon");
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <div className="flex-1 ml-64 py-8 px-6">
        <div className="bg-gray-900 border border-gray-700 rounded-lg">
          <div className="border-b border-gray-600 p-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Coupon Management</h2>
            <button
              onClick={() => setIsCreateFormOpen(!isCreateFormOpen)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <Plus size={20} /> {isCreateFormOpen ? "Close" : "Add New Coupon"}
            </button>
          </div>

          {isCreateFormOpen && (
            <div className="p-6 bg-gray-800 border-b border-gray-700">
              <h3 className="text-xl font-bold mb-4">Create New Coupon</h3>
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Coupon Code"
                    value={newCoupon.code}
                    onChange={(e) => handleInputChange("code", e.target.value)}
                    className={`w-full bg-gray-700 text-white border ${errors.code ? "border-red-500" : "border-gray-600"} rounded-md px-3 py-2`}
                  />
                  {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                </div>
             
                <div>
                  <input
                    type="number"
                    placeholder="Discount Amount (%)"
                    value={newCoupon.discountAmount || ""}
                    onChange={(e) => handleInputChange("discountAmount", Number(e.target.value))}
                    className={`w-full bg-gray-700 text-white border ${errors.discountAmount ? "border-red-500" : "border-gray-600"} rounded-md px-3 py-2`}
                  />
                  {errors.discountAmount && <p className="text-red-500 text-sm mt-1">{errors.discountAmount}</p>}
                </div>
                <div>
                  <label htmlFor="expires" className="block text-sm font-medium mb-1">
                    Expiration Date
                  </label>
                  <input
                    id="expires"
                    type="date"
                    value={newCoupon.expires}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => handleInputChange("expires", e.target.value)}
                    className={`w-full bg-gray-700 text-white border ${errors.expires ? "border-red-500" : "border-gray-600"} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500`}
                    style={{ colorScheme: "dark" }}
                  />
                  {errors.expires && <p className="text-red-500 text-sm mt-1">{errors.expires}</p>}
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Max Uses"
                    value={newCoupon.maxUses || ""}
                    onChange={(e) => handleInputChange("maxUses", Number(e.target.value))}
                    className={`w-full bg-gray-700 text-white border ${errors.maxUses ? "border-red-500" : "border-gray-600"} rounded-md px-3 py-2`}
                  />
                  {errors.maxUses && <p className="text-red-500 text-sm mt-1">{errors.maxUses}</p>}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateCoupon}
                    disabled={Object.keys(errors).length > 0}
                    className={`bg-red-500 text-white px-4 py-2 rounded-md flex-1 ${errors.code || errors.discountAmount || errors.expires || errors.maxUses ? "opacity-50 cursor-not-allowed" : "hover:bg-red-600"}`}
                  >
                    Create
                  </Button>
                  <button
                    onClick={() => {
                      setIsCreateFormOpen(false);
                      setErrors({});
                    }}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Discount</th>
                    <th className="py-3 px-4">Expires</th>
                    <th className="py-3 px-4">Uses</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon._id} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="py-3 px-4">{coupon.code}</td>
                      <td className="py-3 px-4">{`${coupon.discountAmount}%`}</td>
                      <td className="py-3 px-4">{new Date(coupon.expires).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{`${coupon.uses}/${coupon.maxUses}`}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            coupon.status === "active" ? "bg-green-500" : "bg-gray-500"
                          }`}
                        >
                          {coupon.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 flex gap-2">
                        <button onClick={() => handleEditCoupon(coupon)} className="text-gray-400 hover:text-white">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDeleteCoupon(coupon._id)} className="text-gray-400 hover:text-red-500">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {isModalOpen && editingCoupon && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-lg w-96 border border-gray-700">
              <h3 className="text-xl font-bold mb-4">Edit Coupon</h3>
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Coupon Code"
                    value={newCoupon.code}
                    onChange={(e) => handleInputChange("code", e.target.value)}
                    className={`w-full bg-gray-800 text-white border ${errors.code ? "border-red-500" : "border-gray-700"} rounded-md px-3 py-2`}
                  />
                  {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Discount Type</label>
                  <p className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2">Percentage</p>
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Discount Amount (%)"
                    value={newCoupon.discountAmount || ""}
                    onChange={(e) => handleInputChange("discountAmount", Number(e.target.value))}
                    className={`w-full bg-gray-800 text-white border ${errors.discountAmount ? "border-red-500" : "border-gray-700"} rounded-md px-3 py-2`}
                  />
                  {errors.discountAmount && <p className="text-red-500 text-sm mt-1">{errors.discountAmount}</p>}
                </div>
                <div>
                  <label htmlFor="editExpires" className="block text-sm font-medium mb-1">
                    Expiration Date
                  </label>
                  <input
                    id="editExpires"
                    type="date"
                    value={newCoupon.expires}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => handleInputChange("expires", e.target.value)}
                    className={`w-full bg-gray-800 text-white border ${errors.expires ? "border-red-500" : "border-gray-700"} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500`}
                    style={{ colorScheme: "dark" }}
                  />
                  {errors.expires && <p className="text-red-500 text-sm mt-1">{errors.expires}</p>}
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Max Uses"
                    value={newCoupon.maxUses || ""}
                    onChange={(e) => handleInputChange("maxUses", Number(e.target.value))}
                    className={`w-full bg-gray-800 text-white border ${errors.maxUses ? "border-red-500" : "border-gray-700"} rounded-md px-3 py-2`}
                  />
                  {errors.maxUses && <p className="text-red-500 text-sm mt-1">{errors.maxUses}</p>}
                </div>
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={handleUpdateCoupon}
                    disabled={Object.keys(errors).length > 0}
                    className={`bg-red-500 text-white px-4 py-2 rounded-md flex-1 ${errors.code || errors.discountAmount || errors.expires || errors.maxUses ? "opacity-50 cursor-not-allowed" : "hover:bg-red-600"}`}
                  >
                    Update
                  </button>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingCoupon(null);
                      setNewCoupon({ code: "", discountAmount: 0, expires: "", maxUses: 0 });
                      setErrors({});
                    }}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}