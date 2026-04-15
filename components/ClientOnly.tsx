"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { ReactNode } from "react";

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const { hydrated } = useAuthStore();

  if (!hydrated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
