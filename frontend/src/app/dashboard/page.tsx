"use client";

import { useEffect, useState } from "react";
// 1. We import the charting tools here
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardHome() {
  const [jobs, setJobs] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form & Modal State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [editingJobId, setEditingJobId] = useState(null);
  
  const [formData, setFormData] = useState({
    patient_name: "",
    doctor_id: "",
    catalog_id: "",
    tooth_number: "",
    shade: "",
    due_date: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [jobsRes, doctorsRes, catalogRes] = await Promise.all([
        fetch("http://localhost:8001/jobs/"),
        fetch("http://localhost:8001/doctors/"),
        fetch("http://localhost:8001/catalog/")
      ]);

      const jobsData = await jobsRes.json();
      const doctorsData = await doctorsRes.json();
      const catalogData = await catalogRes.json();

      setJobs(jobsData);
      setDoctors(doctorsData);
      setCatalog(catalogData);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openNewJobDrawer = () => {
    setEditingJobId(null);
    setFormData({ patient_name: "", doctor_id: "", catalog_id: "", tooth_number: "", shade: "", due_date: "" });
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (job) => {
    setEditingJobId(job.id);
    setFormData({
      patient_name: job.patient_name,
      doctor_id: job.doctor.id,
      catalog_id: job.item.id,
      tooth_number: job.tooth_number || "",
      shade: job.shade || "",
      due_date: job.due_date,
    });
    setIsDrawerOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingJobId 
        ? `http://localhost:8001/jobs/${editingJobId}` 
        : "http://localhost:8001/jobs/";
      
      const method = editingJobId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          doctor_id: parseInt(formData.doctor_id),
          catalog_id: parseInt(formData.catalog_id),
        }),
      });

      if (!response.ok) throw new Error(`Failed to ${editingJobId ? 'update' : 'add'} job`);

      setIsDrawerOpen(false);
      setFormData({ patient_name: "", doctor_id: "", catalog_id: "", tooth_number: "", shade: "", due_date: "" });
      setEditingJobId(null);
      fetchData(); 
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (jobId, newStatus) => {
    try {
      await fetch(`http://localhost:8001/jobs/${jobId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchData(); 
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };
  
  const confirmDelete = async () => {
    if (!jobToDelete) return;
    try {
      const response = await fetch(`http://localhost:8001/jobs/${jobToDelete}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete job");
      setJobToDelete(null); 
      fetchData(); 
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesTab = activeTab === "All" || job.status === activeTab;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      job.patient_name.toLowerCase().includes(searchLower) ||
      job.doctor.last_name.toLowerCase().includes(searchLower) ||
      job.item.item_name.toLowerCase().includes(searchLower);
      
    return matchesTab && matchesSearch;
  });

  // --- NEW: CALCULATE LIVE STATS FROM YOUR DATABASE ---
  const activeJobsCount = jobs.filter(j => j.status !== 'Completed').length;
  const pendingCount = jobs.filter(j => j.status === 'Pending').length;
  const completedCount = jobs.filter(j => j.status === 'Completed').length;

  // --- REAL-TIME CHART CALCULATION ENGINE ---
  // 1. Create an empty object to hold the counts
  const volumeCounts = {};
  
  // 2. Loop through every job in the database
  jobs.forEach((job) => {
    // We use the doctor's last name for the chart labels to keep it clean
    const docName = `Dr. ${job.doctor.last_name}`;
    
    // If the doctor is already in our object, add 1. If not, start them at 1.
    if (volumeCounts[docName]) {
      volumeCounts[docName] += 1;
    } else {
      volumeCounts[docName] = 1;
    }
  });

  // 3. Convert our counts object into the array format Recharts needs
  const dynamicDoctorChartData = Object.keys(volumeCounts).map((name) => ({
    name: name,
    volume: volumeCounts[name]
  }));

  // 4. Sort them so the doctor with the highest volume is on the left!
  dynamicDoctorChartData.sort((a, b) => b.volume - a.volume);

  return (
    <div className="space-y-8 relative">
      
      {/* --- NEW COMMAND CENTER HEADER --- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Command Center</h1>
          <p className="mt-1 text-slate-500 font-medium">Welcome back. Here is your lab's performance at a glance.</p>
        </div>
        <button 
          onClick={openNewJobDrawer}
          className="rounded-lg bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 shadow-sm"
        >
          + Log New Job
        </button>
      </div>

      {/* --- NEW LIVE STAT CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Active Cases" value={activeJobsCount} icon="🦷" color="bg-blue-50 text-blue-600" />
        <StatCard title="Pending Review" value={pendingCount} icon="⏳" color="bg-amber-50 text-amber-600" />
        <StatCard title="Completed Jobs" value={completedCount} icon="✅" color="bg-emerald-50 text-emerald-600" />
        <StatCard title="Total Doctors" value={doctors.length} icon="👨‍⚕️" color="bg-indigo-50 text-indigo-600" />
      </div>

      {/* --- NEW RECHARTS BAR CHART --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Top Doctors by Volume</h2>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dynamicDoctorChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
              <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="volume" fill="#0EA5E9" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- YOUR ORIGINAL JOBS TABLE STARTS HERE --- */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 mt-8">
        <div className="mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-800">Job Directory</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {["All", "Pending", "In Progress", "Completed"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition ${
                  activeTab === tab 
                    ? "bg-white text-sky-600 shadow-sm ring-1 ring-slate-200/50" 
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search patients, doctors, services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500 animate-pulse">Loading jobs...</div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              {jobs.length === 0 ? "No active jobs. Click above to log your first case!" : "No jobs match your search/filter."}
            </div>
          ) : (
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">Due Date</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">Patient</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">Doctor</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">Service</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">Details</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700 text-right">Status / Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-4 text-sm font-bold text-slate-900">{job.due_date}</td>
                    <td className="px-4 py-4 text-sm font-medium text-slate-700">{job.patient_name}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">Dr. {job.doctor.first_name} {job.doctor.last_name}</td>
                    <td className="px-4 py-4 text-sm font-bold text-sky-600">{job.item.item_name}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {job.tooth_number && <span>Tooth: {job.tooth_number} </span>}
                      {job.shade && <span>(Shade: {job.shade})</span>}
                    </td>
                    <td className="px-4 py-4 text-right flex items-center justify-end gap-3">
                      <select 
                        value={job.status} 
                        onChange={(e) => updateStatus(job.id, e.target.value)}
                        className={`text-sm font-semibold rounded-full px-3 py-1 border-2 outline-none cursor-pointer ${
                          job.status === 'Completed' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 
                          job.status === 'In Progress' ? 'border-amber-200 bg-amber-50 text-amber-700' : 
                          'border-slate-200 bg-slate-50 text-slate-700'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>

                      <button 
                        onClick={() => openEditDrawer(job)}
                        className="text-sky-500 hover:text-sky-700 transition ml-2 text-lg"
                        title="Edit Job"
                      >
                        ✏️
                      </button>

                      <button 
                        onClick={() => setJobToDelete(job.id)}
                        className="text-red-400 hover:text-red-600 font-bold transition text-lg"
                        title="Delete Job"
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

      {/* --- ALL YOUR ORIGINAL MODALS AND DRAWERS ARE STILL HERE --- */}
      {jobToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={() => setJobToDelete(null)}></div>
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <span className="text-red-600 text-xl font-bold">!</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Delete this job?</h3>
              <p className="text-sm text-slate-500 mb-6">
                Are you sure you want to delete this case? This action cannot be undone and will permanently remove it from the board.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setJobToDelete(null)} 
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

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => setIsDrawerOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingJobId ? "Edit Job" : "Log New Job"}
              </h3>
              <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <form id="job-form" onSubmit={handleSubmit} className="space-y-5">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Patient Name</label>
                    <input required type="text" name="patient_name" value={formData.patient_name} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                    <input required type="date" name="due_date" value={formData.due_date} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Requesting Doctor</label>
                  <select required name="doctor_id" value={formData.doctor_id} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500">
                    <option value="" disabled>Select a Doctor...</option>
                    {doctors.map(doc => (
                      <option key={doc.id} value={doc.id}>Dr. {doc.first_name} {doc.last_name} ({doc.clinic_name})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Requested Service</label>
                  <select required name="catalog_id" value={formData.catalog_id} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500">
                    <option value="" disabled>Select a Service...</option>
                    {catalog.map(item => (
                      <option key={item.id} value={item.id}>{item.item_name} - ${item.default_price}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tooth # (Optional)</label>
                    <input type="text" name="tooth_number" placeholder="e.g. 14" value={formData.tooth_number} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Shade (Optional)</label>
                    <input type="text" name="shade" placeholder="e.g. A2" value={formData.shade} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500" />
                  </div>
                </div>

              </form>
            </div>
            
            <div className="border-t px-6 py-4 bg-slate-50 flex justify-end gap-3">
              <button type="button" onClick={() => setIsDrawerOpen(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition">Cancel</button>
              <button type="submit" form="job-form" disabled={isSubmitting} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 transition disabled:opacity-50">
                {isSubmitting ? "Saving..." : editingJobId ? "Update Job" : "Log Job"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// A simple reusable component for the Stat Cards
function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4 transition hover:shadow-md">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-500 mb-1">{title}</p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
}