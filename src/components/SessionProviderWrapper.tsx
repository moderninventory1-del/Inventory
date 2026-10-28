"use client";
// src/components/SessionProviderWrapper.tsx
// Client component to wrap SessionProvider (next-auth v4)

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

export default function SessionProviderWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
