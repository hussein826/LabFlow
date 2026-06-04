"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// 1. Updated our navigation links for the Lab!
const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Doctors", href: "/dashboard/doctors" },
  { label: "Lab Catalog", href: "/dashboard/catalog" },
  { label: "Billing", href: "/dashboard/billing" },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex min-h-screen w-64 flex-col border-r border-slate-200 bg-white px-4 py-6">
      <div className="mb-8 px-2">
        {/* 2. Changed the Logo and Subtitle */}
        <h2 className="text-2xl font-bold text-sky-600">LabFlow</h2>
        <p className="mt-1 text-sm text-slate-500">Laboratory Management</p>
      </div>

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          // Checks if the current URL matches the button's link
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-sky-100 text-sky-700"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}