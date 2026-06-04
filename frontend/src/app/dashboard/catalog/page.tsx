"use client";

import { useEffect, useState } from "react";

export default function CatalogPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Drawer & Form State (For Adding Items)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    item_name: "",
    description: "",
    default_price: ""
  });

  // Modal State (For Editing Prices)
  const [editingItem, setEditingItem] = useState(null);
  const [editPrice, setEditPrice] = useState("");

  // NEW: Modal State (For Deleting Items)
  const [itemToDelete, setItemToDelete] = useState(null);

  // Fetch Catalog from FastAPI
  const fetchCatalog = () => {
    setIsLoading(true);
    fetch("http://localhost:8001/catalog/")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch catalog.");
        return res.json();
      })
      .then((data) => {
        setItems(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  // Handle Form Submission for NEW Items
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:8001/catalog/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          default_price: parseFloat(formData.default_price) 
        }),
      });

      if (!response.ok) throw new Error("Failed to add item");

      setIsDrawerOpen(false); 
      setFormData({ item_name: "", description: "", default_price: "" }); 
      fetchCatalog(); 

    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Form Submission for EDITING Prices
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`http://localhost:8001/catalog/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          default_price: parseFloat(editPrice) 
        }),
      });

      if (!response.ok) throw new Error("Failed to update price");

      setEditingItem(null); 
      fetchCatalog(); 

    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // NEW: Handle Deleting an Item
  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const response = await fetch(`http://localhost:8001/catalog/${itemToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete item");
      
      setItemToDelete(null); // Close the modal
      fetchCatalog(); // Refresh the table
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Lab Catalog</h2>
          <p className="mt-2 text-slate-600">
            Manage your laboratory services and default prices.
          </p>
        </div>

        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          + Add New Item
        </button>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto">
          {error ? (
            <div className="p-4 text-center text-red-500 bg-red-50 rounded-lg">{error}</div>
          ) : isLoading ? (
            <div className="p-8 text-center text-slate-500 animate-pulse">Loading catalog...</div>
          ) : (
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">Item Name</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">Category / Description</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700 text-right">Price ($)</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-4 text-sm font-bold text-slate-900">{item.item_name}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{item.description || "N/A"}</td>
                    <td className="px-4 py-4 text-sm font-medium text-emerald-600 text-right">
                      ${item.default_price.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 flex justify-center items-center gap-4">
                      <button 
                        onClick={() => {
                          setEditingItem(item);
                          setEditPrice(item.default_price);
                        }}
                        className="text-sm font-semibold text-sky-600 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-3 py-1 rounded-md transition"
                      >
                        Edit Price
                      </button>
                      
                      {/* NEW: Delete Button triggers the Custom Modal */}
                      <button 
                        onClick={() => setItemToDelete(item.id)}
                        className="text-red-400 hover:text-red-600 font-bold transition text-lg"
                        title="Delete Item"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* --- NEW: CUSTOM DELETE CONFIRMATION MODAL --- */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={() => setItemToDelete(null)}></div>
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <span className="text-red-600 text-xl font-bold">!</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Delete this service?</h3>
              <p className="text-sm text-slate-500 mb-6">
                Are you sure you want to remove this item from the catalog? You will no longer be able to select it for new jobs.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setItemToDelete(null)} 
                  className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete} 
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT PRICE MODAL --- */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditingItem(null)}></div>
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Edit Price</h3>
            <p className="text-sm text-slate-500 mb-4">{editingItem.item_name}</p>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Price ($)</label>
                <input 
                  required 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  value={editPrice} 
                  onChange={(e) => setEditPrice(e.target.value)} 
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500" 
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setEditingItem(null)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">Cancel</button>
                <button type="submit" className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 transition">Update Price</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD ITEM DRAWER --- */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => setIsDrawerOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">Add Catalog Item</h3>
              <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <form id="add-item-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
                  <input required type="text" name="item_name" placeholder="e.g. Gold Crown" value={formData.item_name} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category / Description</label>
                  <input type="text" name="description" placeholder="e.g. Crowns & Restorations" value={formData.description} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
                  <input required type="number" step="0.01" min="0" name="default_price" placeholder="150.00" value={formData.default_price} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
                </div>
              </form>
            </div>
            <div className="border-t px-6 py-4 bg-slate-50 flex justify-end gap-3">
              <button type="button" onClick={() => setIsDrawerOpen(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition">Cancel</button>
              <button type="submit" form="add-item-form" disabled={isSubmitting} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-50">
                {isSubmitting ? "Saving..." : "Save Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}