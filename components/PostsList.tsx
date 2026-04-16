"use client"

import { useEffect, useState, useCallback } from "react"
import axios from "axios"
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button";
import { PostsPagination } from "@/components/PostsPagination";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { PostCard } from "@/components/PostCard";

interface Post {
  _id: string;
  title: string;
  authorName: string;
  createdAt: string;
  likes: string[];
  imageUrl?: string | null;
}

interface PostsPage {
  posts: Post[];
  total: number;
  page: number;
  totalPages: number;
}

const LIMIT = 2;

export function PostsList() {
  const [data, setData] = useState<PostsPage | null>(null);
  const [page, setPage] = useState(1);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true)
  const [likingIds, setLikingIds] = useState<Set<string>>(new Set());
  const { user, hydrated } = useAuthStore();

  const fetchPosts = useCallback(async (p: number) => {
    setIsLoading(true);
    try {
      const { data } = await axios.get<PostsPage>(
        `/api/posts?page=${p}&limit=${LIMIT}`,
      );
      setData(data);
      setIsUnauthorized(false);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setIsUnauthorized(true);
        setData(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(page);
  }, [fetchPosts, page, user]);

  async function handleLike(e: React.MouseEvent, postId: string) {
    e.preventDefault();
    if (!user) return;
    setLikingIds((prev) => new Set(prev).add(postId));
    try {
      const { data: result } = await axios.post<{ likes: string[] }>(
        `/api/posts/${postId}/like`,
      );
      setData((prev) =>
        prev
          ? {
              ...prev,
              posts: prev.posts.map((p) =>
                p._id === postId ? { ...p, likes: result.likes } : p,
              ),
            }
          : prev,
      );
    } catch {
      toast.error("Failed to like post");
    } finally {
      setLikingIds((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <h2 className="text-lg font-semibold">Community Posts</h2>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner className="size-6" />
        </div>
      ) : isUnauthorized ? (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Login to view posts from other users.
          </p>
          <div className="flex gap-2">
            <Button>
              <Link href="/login">Login</Link>
            </Button>
            <Button variant="outline">
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </div>
      ) : !data || data.posts.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No posts yet. Be the first to write one!
        </p>
      ) : (
        <>
          {data.posts.map((post, i) => (
            <PostCard
              key={post._id}
              post={post}
              href={`/posts/${post._id}`}
              currentUserId={hydrated && user ? user.id : undefined}
              onLike={hydrated && user ? handleLike : undefined}
              isLiking={likingIds.has(post._id)}
              priority={i === 0}
            />
          ))}

          <PostsPagination
            page={page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
