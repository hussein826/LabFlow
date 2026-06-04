"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function DoctorProfile() {
  const params = useParams();
  const doctorId = params.id;
  
  const [account, setAccount] = useState(null);
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch the live Math Engine data!
  const fetchAccount = async () => {
    try {
      const res = await fetch(`http://localhost:8001/billing/account/${doctorId}`);
      if (res.ok) {
        const data = await res.json();
        setAccount(data);
      }
    } catch (err) {
      console.error("Failed to fetch account", err);
    }
  };

  useEffect(() => {
    if (doctorId) fetchAccount();
  }, [doctorId]);

  // 2. Send the cash to the Vault!
  const handlePayment = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount)) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("http://localhost:8001/payments/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor_id: parseInt(doctorId),
          amount: parseFloat(amount),
          reference_note: "Cash"
        })
      });
      
      if (res.ok) {
        setAmount(""); // Clear the input
        fetchAccount(); // Refresh the balances instantly!
      }
    } catch (err) {
      console.error("Payment failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!account) return <div className="p-6 text-slate-500">Loading account...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm ring-1 ring-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900">{account.doctor_name}</h1>
          <p className="text-slate-500 mt-1">Account Summary & Billing</p>
        </div>
      </div>

      {/* The 3 Big Number Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-2xl shadow-sm ring-1 ring-slate-200 border-t-4 border-slate-300">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Work Done</p>
          <p className="text-4xl font-black text-slate-800 mt-2">${account.total_revenue.toFixed(2)}</p>
        </div>

        {/* Total Paid */}
        <div className="bg-white p-6 rounded-2xl shadow-sm ring-1 ring-slate-200 border-t-4 border-emerald-400">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Cash Received</p>
          <p className="text-4xl font-black text-emerald-600 mt-2">${account.total_paid.toFixed(2)}</p>
        </div>

        {/* Current Balance (The Math Engine Result!) */}
        <div className={`bg-white p-6 rounded-2xl shadow-sm ring-1 ring-slate-200 border-t-4 ${account.current_balance > 0 ? 'border-red-400' : 'border-slate-300'}`}>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Current Balance (Debt)</p>
          <p className={`text-4xl font-black mt-2 ${account.current_balance > 0 ? 'text-red-500' : 'text-slate-800'}`}>
            ${account.current_balance.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Log Payment Form */}
      <div className="bg-white p-6 rounded-2xl shadow-sm ring-1 ring-slate-200 mt-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Log a Payment</h2>
        <form onSubmit={handlePayment} className="flex gap-4 items-end">
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-medium text-slate-700 mb-1">Payment Amount ($)</label>
            <input 
              type="number" 
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="e.g. 200.00"
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="rounded-lg bg-emerald-600 px-8 py-2 text-white font-bold hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "+ Add Cash"}
          </button>
        </form>
      </div>

      {/* Payment History Table (NEWLY ADDED) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm ring-1 ring-slate-200 mt-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Payment History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Date</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Amount Received</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Note</th>
              </tr>
            </thead>
            <tbody>
              {account.payments_history && account.payments_history.length > 0 ? (
                account.payments_history.map((payment) => (
                  <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {new Date(payment.payment_date).toLocaleDateString()} at {new Date(payment.payment_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-emerald-600">
                      +${payment.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                        {payment.reference_note}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-500">
                    No payments logged yet. When Dr. {account.doctor_name.replace("Dr. ", "")} pays, it will appear here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}