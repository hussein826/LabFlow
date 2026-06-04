"use client";

import { useEffect, useState } from "react";

export default function BillingPage() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [invoice, setInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch the list of doctors for the dropdown
  useEffect(() => {
    fetch("http://localhost:8001/doctors/")
      .then((res) => res.json())
      .then((data) => setDoctors(data))
      .catch((err) => console.error("Failed to load doctors", err));
  }, []);

  // 2. Fetch the invoice from our new backend route!
  const generateInvoice = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) return;

    setIsLoading(true);
    setError(null);
    setInvoice(null);

    try {
      const response = await fetch(`http://localhost:8001/billing/invoice/${selectedDoctorId}`);
      if (!response.ok) {
        throw new Error("Could not generate invoice. Make sure this doctor has 'Completed' jobs.");
      }
      const data = await response.json();
      setInvoice(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. The Print Function
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* --- CONTROLS SECTION (Hidden when printing) --- */}
      <div className="print:hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Generate Invoice</h2>
        <form onSubmit={generateInvoice} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Select a Doctor</label>
            <select 
              required
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-sky-500"
            >
              <option value="" disabled>Choose a client...</option>
              {doctors.map(doc => (
                <option key={doc.id} value={doc.id}>
                  Dr. {doc.first_name} {doc.last_name} ({doc.clinic_name})
                </option>
              ))}
            </select>
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="rounded-lg bg-sky-600 px-6 py-2 text-white font-semibold hover:bg-sky-700 transition disabled:opacity-50"
          >
            {isLoading ? "Calculating..." : "Generate Bill"}
          </button>
        </form>
        {error && <p className="mt-4 text-red-500 font-medium">{error}</p>}
      </div>

      {/* --- INVOICE SECTION (This is what gets printed!) --- */}
      {invoice && (
        <div className="rounded-2xl bg-white p-10 shadow-lg ring-1 ring-slate-200 print:shadow-none print:ring-0 print:p-0">
          
          {/* Header Row */}
          <div className="flex justify-between items-start border-b-2 border-slate-200 pb-6 mb-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">INVOICE</h1>
              <p className="text-slate-500 mt-1">Date: {new Date().toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-sky-600">LabFlow Dental Studio</h2>
              <p className="text-slate-500 text-sm">Ali's Laboratory</p>
              <p className="text-slate-500 text-sm">Beirut, Lebanon</p>
            </div>
          </div>

          {/* Bill To Row */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Bill To</h3>
            <p className="text-lg font-bold text-slate-900">Dr. {invoice.doctor.first_name} {invoice.doctor.last_name}</p>
            <p className="text-slate-600">{invoice.doctor.clinic_name}</p>
            {invoice.doctor.phone && <p className="text-slate-600">{invoice.doctor.phone}</p>}
            {invoice.doctor.email && <p className="text-slate-600">{invoice.doctor.email}</p>}
          </div>

          {/* Jobs Table */}
          <table className="min-w-full mb-8">
            <thead>
              <tr className="border-b border-slate-300 text-left">
                <th className="py-3 font-semibold text-slate-800">Date Completed</th>
                <th className="py-3 font-semibold text-slate-800">Patient</th>
                <th className="py-3 font-semibold text-slate-800">Service Description</th>
                <th className="py-3 font-semibold text-slate-800 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.jobs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-500 italic">No completed jobs found for this period.</td>
                </tr>
              ) : (
                invoice.jobs.map((job) => (
                  <tr key={job.id} className="border-b border-slate-100">
                    <td className="py-4 text-slate-600">{job.due_date}</td>
                    <td className="py-4 text-slate-800 font-medium">{job.patient_name}</td>
                    <td className="py-4 text-slate-600">
                      {job.item.item_name}
                      {job.tooth_number && <span className="text-xs ml-2 bg-slate-100 px-2 py-1 rounded text-slate-500">Tooth {job.tooth_number}</span>}
                    </td>
                    <td className="py-4 text-right font-medium text-slate-800">
                      ${job.item.default_price.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-3 border-t-2 border-slate-800">
                <span className="font-bold text-slate-800 text-lg">Total Due</span>
                <span className="font-bold text-emerald-600 text-xl">${invoice.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Print Button */}
          <div className="mt-12 flex justify-center print:hidden">
            <button 
              onClick={handlePrint}
              className="rounded-full bg-slate-800 px-8 py-3 text-white font-bold hover:bg-slate-700 transition shadow-lg flex items-center gap-2"
            >
              🖨️ Print / Save as PDF
            </button>
          </div>

        </div>
      )}
    </div>
  );
}