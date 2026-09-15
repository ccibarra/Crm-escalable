"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
  },
  {
    name: "Contactos",
    href: "/contacts",
  },
  {
    name: "Oportunidades",
    href: "/deals",
  },
  {
    name: "Interacciones",
    href: "/interactions",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex min-h-screen w-64 flex-col bg-gray-900 text-white">
      <div className="border-b border-gray-800 p-6">
        <h1 className="text-2xl font-bold">CRM</h1>
        <p className="mt-1 text-sm text-gray-400">
          Gestión comercial
        </p>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-4 py-3 transition ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}