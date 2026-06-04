export default function AppointmentsPage() {
  const appointments = [
    {
      id: 1,
      patient: "Sarah Johnson",
      dentist: "Dr. Karim Haddad",
      date: "2026-04-22",
      time: "09:00 AM",
      status: "Scheduled",
    },
    {
      id: 2,
      patient: "Michael Reed",
      dentist: "Dr. Lina Saad",
      date: "2026-04-22",
      time: "10:30 AM",
      status: "Completed",
    },
    {
      id: 3,
      patient: "Nadine Khalil",
      dentist: "Dr. Karim Haddad",
      date: "2026-04-22",
      time: "12:00 PM",
      status: "Cancelled",
    },
    {
      id: 4,
      patient: "Omar Hassan",
      dentist: "Dr. Maya Zein",
      date: "2026-04-23",
      time: "02:15 PM",
      status: "Scheduled",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Appointments</h2>
          <p className="mt-2 text-slate-600">
            Manage visit schedules, assign dentists, and track appointment
            status.
          </p>
        </div>

        <button className="rounded-lg bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700">
          Add Appointment
        </button>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            placeholder="Search by patient or dentist"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-sky-500 sm:max-w-md"
          />

          <div className="text-sm text-slate-500">
            Total Appointments: {appointments.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                  Patient
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                  Dentist
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                  Date
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                  Time
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {appointments.map((appointment) => (
                <tr
                  key={appointment.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-4 py-4 text-sm font-medium text-slate-900">
                    {appointment.patient}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">
                    {appointment.dentist}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">
                    {appointment.date}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">
                    {appointment.time}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        appointment.status === "Scheduled"
                          ? "bg-sky-100 text-sky-700"
                          : appointment.status === "Completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}