"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { toast } from "sonner"
import { Pencil, Trash2, Check, X, ArrowLeft, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/useAuthStore";
import { ClientOnly } from "@/components/ClientOnly";
import { CommentsSection } from "@/components/CommentsSection";

interface Post {
  _id: string;
  userId: string;
  title: string;
  description: string;
  likes: string[];
  createdAt: string;
}

interface Comment {
  _id: string;
  userId: string;
  content: string;
  authorName: string;
  createdAt: string;
}

const editSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
})

type EditFormValues = z.infer<typeof editSchema>

export default function PostPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const searchParams = useSearchParams();
  const backTo = searchParams.get("from") === "my-posts" ? "/my-posts" : "/";
  const { user, hydrated } = useAuthStore();
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLiking, setIsLiking] = useState(false)

  const isOwner = !!post && !!user && post.userId === user.id;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
  })

  useEffect(() => {
    Promise.all([
      axios.get<Post>(`/api/posts/${id}`),
      axios
        .get<Comment[]>(`/api/posts/${id}/comments`)
        .catch(() => ({ data: [] as Comment[] })),
    ])
      .then(([{ data: postData }, { data: commentsData }]) => {
        setPost(postData);
        setComments(commentsData);
        reset({ title: postData.title, description: postData.description });
      })
      .catch(() => toast.error("Failed to load post"))
      .finally(() => setIsLoading(false));
  }, [id, reset])

  async function handleLike() {
    if (!user) return;
    setIsLiking(true);
    try {
      const { data } = await axios.post<{ likes: string[] }>(`/api/posts/${id}/like`);
      setPost((prev) => prev ? { ...prev, likes: data.likes } : prev);
    } catch {
      toast.error("Failed to like post");
    } finally {
      setIsLiking(false);
    }
  }


  async function onSubmit(values: EditFormValues) {
    try {
      const { data } = await axios.put<Post>(`/api/posts/${id}`, values)
      setPost(data)
      setEditing(false)
      toast.success("Post updated!")
    } catch (err) {
      toast.error(axios.isAxiosError(err) ? (err.response?.data?.error ?? "Failed to update post") : "Failed to update post")
    }
  }

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await axios.delete(`/api/posts/${id}`)
      toast.success("Post deleted")
      router.push(backTo);
    } catch (err) {
      toast.error(axios.isAxiosError(err) ? (err.response?.data?.error ?? "Failed to delete post") : "Failed to delete post")
      setIsDeleting(false)
    }
  }


  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Skeleton className="h-9 w-20 mb-6" />
        <Skeleton className="h-9 w-3/4 mb-3" />
        <Skeleton className="h-4 w-32 mb-8" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <Separator className="my-10" />
        <Skeleton className="h-6 w-28 mb-6" />
        <Skeleton className="h-20 w-full mb-4" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Post not found.</p>
        <Button variant="outline" onClick={() => router.push(backTo)}>
          <ArrowLeft className="size-4 mr-2" /> Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Button
        variant="ghost"
        className="mb-6 -ml-2"
        onClick={() => router.push(backTo)}
      >
        <ArrowLeft className="size-4 mr-2" /> Back
      </Button>

      {editing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Input
              className="text-2xl font-bold h-auto py-2"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <Textarea rows={10} {...register("description")} />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Spinner className="size-4 mr-2" />
              ) : (
                <Check className="size-4 mr-2" />
              )}
              Save
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset({ title: post.title, description: post.description });
                setEditing(false);
              }}
              disabled={isSubmitting}
            >
              <X className="size-4 mr-2" /> Cancel
            </Button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-3xl font-bold">{post.title}</h1>
            <ClientOnly>
              <div className="flex gap-2 shrink-0 items-center">
                {hydrated && !!user && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleLike}
                    disabled={isLiking}
                  >
                    <Heart
                      className={`size-4 mr-1 ${
                        post.likes?.includes(user.id)
                          ? "fill-red-500 text-red-500"
                          : "text-red-500"
                      }`}
                    />
                    {post.likes?.length ?? 0}
                  </Button>
                )}
                {isOwner && (
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setEditing(true)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Spinner className="size-4" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </ClientOnly>
          </div>
          <p className="text-xs text-muted-foreground mb-8">
            {new Date(post.createdAt).toLocaleString()}
          </p>
          <p className="text-base leading-relaxed whitespace-pre-wrap">
            {post.description}
          </p>
        </>
      )}

      <Separator className="my-10" />
      <CommentsSection postId={id as string} initialComments={comments} />
    </div>
  );
}
