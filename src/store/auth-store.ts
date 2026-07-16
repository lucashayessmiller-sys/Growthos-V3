"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AuthState {
  isAuthenticated: boolean
  name: string
  email: string
  login: (name: string, email: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      name: "",
      email: "",
      login: (name, email) => set({ isAuthenticated: true, name, email }),
      logout: () => set({ isAuthenticated: false, name: "", email: "" }),
    }),
    { name: "growthos-auth" }
  )
)
