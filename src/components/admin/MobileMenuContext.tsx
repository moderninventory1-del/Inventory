"use client";
// src/components/admin/MobileMenuContext.tsx
// Shared context so page headers can trigger the sidebar open without prop drilling

import { createContext, useContext, useState, type ReactNode } from "react";

interface MobileMenuContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const MobileMenuContext = createContext<MobileMenuContextValue | null>(null);

export function MobileMenuProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <MobileMenuContext.Provider
      value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}
    >
      {children}
    </MobileMenuContext.Provider>
  );
}

export function useMobileMenu() {
  const ctx = useContext(MobileMenuContext);
  if (!ctx) throw new Error("useMobileMenu must be used inside MobileMenuProvider");
  return ctx;
}
