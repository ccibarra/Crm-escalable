"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface CurrentUser {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  role: string;
  is_active: boolean;
}

export default function CRMLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const currentUser = await apiFetch<CurrentUser>(
          "/api/v1/auth/me",
          {
            token,
          }
        );

        setUser(currentUser);
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">
          Cargando CRM...
        </p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          userName={`${user.nombre} ${user.apellido}`}
          userRole={user.role}
        />

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}