"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/authStore";

export default function AdminRoute({
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
      return;
    }

    if (user.role !== "admin") {
      router.push("/");
    }
  }, [user, router]);

  if (
    !user ||
    user.role !== "admin"
  ) {
    return (
      <div className="py-20 text-center">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}