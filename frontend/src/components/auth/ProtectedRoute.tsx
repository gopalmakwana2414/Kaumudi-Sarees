"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/authStore";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const user = useAuthStore(
    (state) => state.user
  );

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="py-20 text-center">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}