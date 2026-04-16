"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import axios from "axios";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner"
import { AddPostForm } from "@/components/AddPostForm"
import { AppHeader } from "@/components/AppHeader"
import { PostsPagination } from "@/components/PostsPagination";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { PostCard } from "@/components/PostCard";

interface Post {
  _id: string;
  title: string;
  createdAt: string;
  imageUrl?: string | null;
  likes: string[];
}

interface PostsPage {
  posts: Post[];
  total: number;
  page: number;
  totalPages: number;
}

const LIMIT = 2;

export default function MyPostsPage() {
  const router = useRouter()
  const { isReady } = useRequireAuth("/login")
  const [data, setData] = useState<PostsPage | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true)

  const fetchPosts = useCallback(
    async (p: number) => {
      setIsLoading(true);
      try {
        const { data } = await axios.get<PostsPage>(
          `/api/posts/mine?page=${p}&limit=${LIMIT}`,
        );
        setData(data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          router.push("/login");
        } else {
          toast.error("Failed to load posts");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  useEffect(() => {
    if (!isReady) return;
    fetchPosts(page);
  }, [isReady, fetchPosts, page]);

  if (!isReady) return null

  return (
    <div className="relative min-h-screen">
      <AppHeader />
      <div className="flex justify-center pt-24 px-4 pb-8">
        <div className="flex flex-col gap-8 w-full max-w-lg">
          <h1 className="text-xl font-semibold">My Posts</h1>

          <AddPostForm onPostAdded={() => fetchPosts(page)} />

          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Published ({data?.total ?? 0})
            </h2>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Spinner className="size-6" />
              </div>
            ) : !data || data.posts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No posts yet. Write your first one above!
              </p>
            ) : (
              <>
                {data.posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    href={`/posts/${post._id}?from=my-posts`}
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
        </div>
      </div>
    </div>
  );
}
