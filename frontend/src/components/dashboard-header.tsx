export default function DashboardHeader() {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Dental Clinic Dashboard
        </h1>
        <p className="text-sm text-slate-500">
          Manage clinic activity, appointments, and billing
        </p>
      </div>

      <div className="rounded-full bg-sky-100 px-4 py-2 text-sm font-medium text-sky-700">
        Admin
      </div>
    </header>
  );
}