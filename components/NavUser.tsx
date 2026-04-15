"use client"

import {
  ChevronsUpDown,
  LogOut,
  FileText,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function NavUser() {
  const { user, setUser, setToken, clearAuth, hydrated } = useAuthStore();
  const [isPending, setIsPending] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    
    const checkAuth = async () => {
      try {
        const res = await axios.get("/api/auth/me");
        const data = res.data;
        if (data.user) {
          setUser(data.user);
          if (data.token) setToken(data.token);
        } else {
          clearAuth();
        }
      } catch {
        clearAuth();
      } finally {
        setIsPending(false);
      }
    };
    
    checkAuth();
  }, [hydrated, setUser, setToken, clearAuth]);

  const handleSignOut = async () => {
    await axios.post("/api/auth/logout");
    clearAuth();
    router.push("/");
  };

  if (!hydrated || isPending) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <div className="grid gap-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="ml-auto h-4 w-4" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex gap-2">
        <Button>
          <Link href="/login">Login</Link>
        </Button>
        <Button variant="outline">
          <Link href="/register">Register</Link>
        </Button>
      </div>
    );
  }

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email.slice(0, 2).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar className="h-8 w-8 rounded-lg">
          <AvatarImage src="" alt={user.name ?? user.email} />
          <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">
            {user.name ?? user.email}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {user.email}
          </span>
        </div>
        <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-56 rounded-lg"
        align="end"
        sideOffset={4}
      >
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src="" alt={user.name ?? user.email} />
            <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">
              {user.name ?? user.email}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link href="/my-posts" className="flex items-center cursor-pointer">
              <FileText className="mr-2 size-4" />
              My Posts
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
