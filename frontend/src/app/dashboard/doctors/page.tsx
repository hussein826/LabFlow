"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Drawer & Form State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    clinic_name: "",
    email: "",
    phone: ""
  });

  // Fetch Doctors from FastAPI
  const fetchDoctors = () => {
    setIsLoading(true);
    fetch("http://localhost:8001/doctors/")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data.");
        return res.json();
      })
      .then((data) => {
        const formattedDoctors = data.map((doc) => ({
          id: doc.id,
          name: `Dr. ${doc.first_name} ${doc.last_name}`,
          clinic: doc.clinic_name,
          phone: doc.phone || "N/A",
          email: doc.email || "N/A",
        }));
        setDoctors(formattedDoctors);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:8001/doctors/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // FIXED: This forces JavaScript to turn the error object into readable text!
        const errorMessage = typeof errorData.detail === 'string' 
          ? errorData.detail 
          : JSON.stringify(errorData.detail);
        throw new Error(errorMessage || "Failed to add doctor");
      }

      setIsDrawerOpen(false); 
      setFormData({ first_name: "", last_name: "", clinic_name: "", email: "", phone: "" }); 
      fetchDoctors(); 

    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Doctors</h2>
          <p className="mt-2 text-slate-600">
            Manage your laboratory clients and their clinic details.
          </p>
        </div>

        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="rounded-lg bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
        >
          + Add Doctor
        </button>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            placeholder="Search doctors by name or clinic..."
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-sky-500 sm:max-w-md"
          />
          <div className="text-sm text-slate-500">
            Total Clients: {doctors.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          {error ? (
            <div className="p-4 text-center text-red-500 bg-red-50 rounded-lg">{error}</div>
          ) : isLoading ? (
            <div className="p-8 text-center text-slate-500 animate-pulse">Loading doctors...</div>
          ) : (
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">Doctor Name</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">Clinic</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">Phone</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">Email</th>
                  {/* NEW ACTIONS HEADER */}
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doc) => (
                  <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-4 text-sm font-medium text-slate-900">{doc.name}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{doc.clinic}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{doc.phone}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{doc.email}</td>
                    
                    {/* NEW BILLING BUTTON COLUMN */}
                    <td className="px-4 py-4 text-sm text-right">
                      <Link 
                        href={`/dashboard/doctors/${doc.id}`}
                        className="inline-flex items-center justify-center rounded-lg bg-sky-50 px-3 py-1.5 text-sm font-bold text-sky-600 hover:bg-sky-100 transition ring-1 ring-inset ring-sky-600/20"
                      >
                        Billing &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
                {doctors.length === 0 && (
                  <tr>
                    {/* UPDATED COLSPAN TO 5 */}
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                      No doctors found. Click "Add Doctor" to create your first client.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* --- SLIDE-OVER DRAWER --- */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => setIsDrawerOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
            
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">Add New Doctor</h3>
              <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              <form id="add-doctor-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                    <input required type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                    <input required type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Clinic Name</label>
                  <input required type="text" name="clinic_name" value={formData.clinic_name} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500" />
                </div>
              </form>
            </div>

            <div className="border-t px-6 py-4 bg-slate-50 flex justify-end gap-3">
              <button type="button" onClick={() => setIsDrawerOpen(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition">Cancel</button>
              <button type="submit" form="add-doctor-form" disabled={isSubmitting} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 transition disabled:opacity-50">
                {isSubmitting ? "Saving..." : "Save Doctor"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}