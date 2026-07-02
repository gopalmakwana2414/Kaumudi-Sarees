"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

interface AuthStore {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  // kept for backward compat — persist middleware handles rehydration now
  loadUser: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,

      login: (user, token) => {
        set({ user, token });
      },

      logout: () => {
        set({ user: null, token: null });
      },

      // No-op: persist middleware auto-rehydrates from localStorage on mount
      loadUser: () => {},
    }),
    {
      name: "auth-storage", // ← matches what api.ts reads
    }
  )
);
