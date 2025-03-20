"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Sidebar from "./adminComponents/aside-side";

interface Coupon {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountAmount: number;
  expires: string; // ISO date string
  maxUses: number;
  uses: number;
  status: "active" | "expired";
}

export default function AdminCouponPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountType: "percentage" as const,
    discountAmount: 0,
    expires: "",
    maxUses: 0,
  });
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

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

  // Simulate fetching coupons (replace with your API call)
  useEffect(() => {
    const mockCoupons: Coupon[] = [
    //   { id: "1", code: "MUSIC20", discountType: "percentage", discountAmount: 20, expires: "2025-12-31", maxUses: 100, uses: 45, status: "active" },
    //   { id: "2", code: "PREM10", discountType: "fixed", discountAmount: 10, expires: "2025-03-01", maxUses: 50, uses: 50, status: "expired" },
    ];
    setCoupons(mockCoupons);
  }, []);

  const handleCreateCoupon = () => {
    const coupon: Coupon = {
      id: Date.now().toString(), // Temporary ID, replace with backend ID
      ...newCoupon,
      uses: 0,
      status: new Date(newCoupon.expires) > new Date() ? "active" : "expired",
    };
    setCoupons([...coupons, coupon]);
    setNewCoupon({ code: "", discountType: "percentage", discountAmount: 0, expires: "", maxUses: 0 });
    setIsModalOpen(false);
    toast.success("Coupon created successfully!");
    // Add API call here to save to backend
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setNewCoupon({
      code: coupon.code,
      discountType: coupon.discountType,
      discountAmount: coupon.discountAmount,
      expires: coupon.expires,
      maxUses: coupon.maxUses,
    });
    setIsModalOpen(true);
  };

  const handleUpdateCoupon = () => {
    if (!editingCoupon) return;
    const updatedCoupon = { ...editingCoupon, ...newCoupon, status: new Date(newCoupon.expires) > new Date() ? "active" : "expired" };
    setCoupons(coupons.map((c) => (c.id === editingCoupon.id ? updatedCoupon : c)));
    setEditingCoupon(null);
    setNewCoupon({ code: "", discountType: "percentage", discountAmount: 0, expires: "", maxUses: 0 });
    setIsModalOpen(false);
    toast.success("Coupon updated successfully!");
    // Add API call here to update backend
  };

  const handleDeleteCoupon = (id: string) => {
    setCoupons(coupons.filter((c) => c.id !== id));
    toast.success("Coupon deleted successfully!");
    // Add API call here to delete from backend
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <div className="flex-1 ml-64 py-8 px-6">
        <div className="bg-gray-900 border border-gray-700 rounded-lg">
          {/* Header */}
          <div className="border-b border-gray-600 p-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Coupon & Offer Management</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <Plus size={20} /> Add New Coupon
            </button>
          </div>

          {/* Coupon List */}
          <div className="p-6">
            <div className="flex items-center mb-4">
              <Search className="text-gray-400 mr-2" size={20} />
              <input
                type="text"
                placeholder="Search coupons..."
                className="bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
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
                    <tr key={coupon.id} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="py-3 px-4">{coupon.code}</td>
                      <td className="py-3 px-4">
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountAmount}%`
                          : `$${coupon.discountAmount}`}
                      </td>
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
                        <button
                          onClick={() => handleEditCoupon(coupon)}
                          className="text-gray-400 hover:text-white"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
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

        {/* Modal for Create/Edit */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-lg w-96 border border-gray-700">
              <h3 className="text-xl font-bold mb-4">
                {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Coupon Code"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2"
                />
                <select
                  value={newCoupon.discountType}
                  onChange={(e) =>
                    setNewCoupon({ ...newCoupon, discountType: e.target.value as "percentage" | "fixed" })
                  }
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
                <input
                  type="number"
                  placeholder="Discount Amount"
                  value={newCoupon.discountAmount}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discountAmount: Number(e.target.value) })}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2"
                />
                <input
                  type="date"
                  value={newCoupon.expires}
                  onChange={(e) => setNewCoupon({ ...newCoupon, expires: e.target.value })}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Max Uses"
                  value={newCoupon.maxUses}
                  onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: Number(e.target.value) })}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2"
                />
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={editingCoupon ? handleUpdateCoupon : handleCreateCoupon}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex-1"
                >
                  {editingCoupon ? "Update" : "Create"}
                </button>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingCoupon(null);
                    setNewCoupon({ code: "", discountType: "percentage", discountAmount: 0, expires: "", maxUses: 0 });
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}