"use client";

import { useRouter } from "next/navigation";

import { removeToken } from "@/lib/auth";

interface HeaderProps {
  userName: string;
  userRole: string;
}

export default function Header({
  userName,
  userRole,
}: HeaderProps) {
  const router = useRouter();

  function handleLogout() {
    removeToken();
    router.replace("/login");
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div>
        <h2 className="font-semibold text-gray-900">
          CRM
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            {userName}
          </p>

          <p className="text-xs text-gray-500">
            {userRole}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
        >
          Salir
        </button>
      </div>
    </header>
  );
}