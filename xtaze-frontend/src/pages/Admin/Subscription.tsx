import { useState, useEffect } from "react";
import { ChevronLeft, Plus, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./adminComponents/aside-side";
import { toast } from "sonner";

interface StripeProduct {
  id: string;
  name: string;
  description?: string;
  active: boolean;
}

interface StripePrice {
  id: string;
  product: string;
  unit_amount: number;
  currency: string;
  recurring?: { interval: "month" | "year" };
  active: boolean;
}

interface SubscriptionPlan {
  product: StripeProduct;
  price: StripePrice;
}

export default function AdminSubscriptionPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: "",
    description: "",
    price: "",
    interval: "month" as "month" | "year",
  });
  const [editPlan, setEditPlan] = useState<SubscriptionPlan | null>(null); // Track plan being edited

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:3000/admin/stripe/plans");
        setPlans(response.data.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load subscription plans");
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleCreatePlan = async () => {
    try {
      const unitAmount = parseFloat(newPlan.price);
      const res = await axios.post("http://localhost:3000/admin/stripe/createProduct", {
        name: newPlan.name,
        description: newPlan.description,
        price: unitAmount,
        interval: newPlan.interval,
      });
      setPlans([...plans, res.data.data]);
      setNewPlan({ name: "", description: "", price: "", interval: "month" });
      setIsFormOpen(false);
      toast.success("Plan created successfully");
    } catch (err) {
      console.error(err);
      setError("Failed to create plan");
    }
  };

  const handleEditPlan = (productId: string) => {
    const planToEdit = plans.find((plan) => plan.product.id === productId);
    if (planToEdit) {
      setEditPlan(planToEdit);
    }
  };

  const handleUpdatePlan = async () => {
    if (!editPlan) return;
    try {
      const unitAmount = parseFloat(editPlan.price.unit_amount / 100 + ""); // Convert back to dollars
      const res = await axios.put(`http://localhost:3000/admin/stripe/products/?productId=${editPlan.product.id}`, {
        name: editPlan.product.name,
        description: editPlan.product.description,
        price: unitAmount,
        interval: editPlan.price.recurring?.interval || "month",
      });
      setPlans(plans.map((plan) =>
        plan.product.id === editPlan.product.id ? res.data.data : plan
      ));
      setEditPlan(null);
      toast.success("Plan updated successfully");
    } catch (err) {
      console.error(err);
      setError("Failed to update plan");
    }
  };

  const handleArchivePlan = async (productId: string) => {
    try {
      const res = await axios.post(`http://localhost:3000/admin/stripe/products/delete?productId=${productId}`);
      setPlans(plans.filter((plan) => plan.product.id !== productId));
      if (res.status === 200) {
        toast.success("Plan deleted successfully");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to archive plan");
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <div className="flex-1 ml-64 py-7 px-6 pb-20">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition mb-4" title="Go back">
          <ChevronLeft className="h-5 w-5 text-gray-400" />
        </button>

        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Subscription Plans</h1>
            <button onClick={() => setIsFormOpen(!isFormOpen)} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition">
              <Plus className="h-5 w-5" /> Create Plan
            </button>
          </div>

          {/* Create Form */}
          {isFormOpen && (
            <div className="bg-[#151515] p-6 rounded-xl shadow-lg border border-gray-900">
              <h2 className="text-xl font-semibold mb-4">New Subscription Plan</h2>
              <div className="space-y-4">
                <input value={newPlan.name} onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })} placeholder="Plan Name" className="w-full bg-gray-800 text-white p-2 rounded-md border border-gray-700" />
                <input value={newPlan.description} onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })} placeholder="Description" className="w-full bg-gray-800 text-white p-2 rounded-md border border-gray-700" />
                <input type="number" value={newPlan.price} onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })} placeholder="Price (e.g., 10.00)" className="w-full bg-gray-800 text-white p-2 rounded-md border border-gray-700" />
                <select value={newPlan.interval} onChange={(e) => setNewPlan({ ...newPlan, interval: e.target.value as "month" | "year" })} className="w-full bg-gray-800 text-white p-2 rounded-md border border-gray-700">
                  <option value="month">Monthly</option>
                  <option value="year">Yearly</option>
                </select>
                <div className="flex gap-4">
                  <button onClick={handleCreatePlan} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition">Save</button>
                  <button onClick={() => setIsFormOpen(false)} className="bg-gray-900 hover:bg-gray-800 text-gray-400 px-4 py-2 rounded-md transition">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Form */}
          {editPlan && (
            <div className="bg-[#151515] p-6 rounded-xl shadow-lg border border-gray-900">
              <h2 className="text-xl font-semibold mb-4">Edit Subscription Plan</h2>
              <div className="space-y-4">
                <input
                  value={editPlan.product.name}
                  onChange={(e) => setEditPlan({ ...editPlan, product: { ...editPlan.product, name: e.target.value } })}
                  placeholder="Plan Name"
                  className="w-full bg-gray-800 text-white p-2 rounded-md border border-gray-700"
                />
                <input
                  value={editPlan.product.description || ""}
                  onChange={(e) => setEditPlan({ ...editPlan, product: { ...editPlan.product, description: e.target.value } })}
                  placeholder="Description"
                  className="w-full bg-gray-800 text-white p-2 rounded-md border border-gray-700"
                />
                <input
                  type="number"
                  value={editPlan.price.unit_amount / 100}
                  onChange={(e) => setEditPlan({ ...editPlan, price: { ...editPlan.price, unit_amount: parseFloat(e.target.value) * 100 } })}
                  placeholder="Price (e.g., 10.00)"
                  className="w-full bg-gray-800 text-white p-2 rounded-md border border-gray-700"
                />
                <select
                  value={editPlan.price.recurring?.interval || "month"}
                  onChange={(e) => setEditPlan({ ...editPlan, price: { ...editPlan.price, recurring: { interval: e.target.value as "month" | "year" } } })}
                  className="w-full bg-gray-800 text-white p-2 rounded-md border border-gray-700"
                >
                  <option value="month">Monthly</option>
                  <option value="year">Yearly</option>
                </select>
                <div className="flex gap-4">
                  <button onClick={handleUpdatePlan} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition">Update</button>
                  <button onClick={() => setEditPlan(null)} className="bg-gray-900 hover:bg-gray-800 text-gray-400 px-4 py-2 rounded-md transition">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Plans Table */}
          {loading ? (
            <p className="text-gray-400 text-center py-4">Loading plans...</p>
          ) : error ? (
            <p className="text-red-400 text-center py-4">{error}</p>
          ) : plans.length > 0 ? (
            <div className="bg-[#151515] rounded-xl shadow-lg border border-gray-900 overflow-hidden">
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-6 py-4 text-gray-400 text-lg font-semibold border-b border-gray-700">
                <span>Name</span>
                <span>Price</span>
                <span>Interval</span>
                <span className="text-right">Actions</span>
              </div>
              {plans.map((plan) => (
                <div key={plan.product.id} className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-6 py-4 hover:bg-[#212121] transition-all duration-200 items-center">
                  <span className="text-white truncate">{plan.product.name}</span>
                  <span className="text-gray-400">${(plan.price.unit_amount / 100).toFixed(2)}</span>
                  <span className="text-gray-400">{plan.price.recurring?.interval || "N/A"}</span>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEditPlan(plan.product.id)} className="text-gray-400 hover:text-white">
                      <Edit className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleArchivePlan(plan.product.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#1d1d1d] p-8 rounded-xl shadow-md border border-gray-800 text-center">
              <p className="text-gray-400 text-lg">No subscription plans yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}