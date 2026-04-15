import Link from "next/link";
import { NavUser } from "@/components/NavUser";

export function AppHeader() {
  return (
    <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-4 py-3 border-b bg-background/80 backdrop-blur-sm z-10">
      <Link
        href="/"
        className="font-semibold text-sm hover:opacity-80 transition-opacity"
      >
        Home
      </Link>
      <NavUser />
    </div>
  );
}
