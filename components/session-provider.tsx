"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";

/**
 * Client-side wrapper to provide next-auth session context to client components.
 * Import and use this in `app/layout.tsx` (a server component) so `useSession`
 * works in child client components.
 */
export default function NextAuthSessionProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
