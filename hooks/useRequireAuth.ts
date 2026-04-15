import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export function useRequireAuth(redirectTo: string = "/login") {
  const { user, hydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !user) {
      router.push(redirectTo);
    }
  }, [hydrated, user, router, redirectTo]);

  return { user, isReady: hydrated && !!user };
}
