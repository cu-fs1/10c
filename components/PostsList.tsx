"use client"

import { useEffect, useState, useCallback } from "react"
import axios from "axios"
import Link from "next/link"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button";
import { PostsPagination } from "@/components/PostsPagination";

interface Post {
  _id: string;
  title: string;
  authorName: string;
  createdAt: string;
}

interface PostsPage {
  posts: Post[];
  total: number;
  page: number;
  totalPages: number;
}

const LIMIT = 6;

export function PostsList() {
  const [data, setData] = useState<PostsPage | null>(null);
  const [page, setPage] = useState(1);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true)

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
  }, [fetchPosts, page]);

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
          {data.posts.map((post) => (
            <Link key={post._id} href={`/posts/${post._id}`}>
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{post.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {post.authorName} &middot;{" "}
                    {new Date(post.createdAt).toLocaleString()}
                  </p>
                </CardHeader>
              </Card>
            </Link>
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
