"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { toast } from "sonner"
import { Pencil, Trash2, Check, X, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/useAuthStore";
import { ClientOnly } from "@/components/ClientOnly";
import { CommentsSection } from "@/components/CommentsSection";

interface Post {
  _id: string;
  userId: string;
  title: string;
  description: string;
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
  const [isLoading, setIsLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isOwner = !!post && !!user && post.userId === user.id;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
  })

  useEffect(() => {
    axios.get<Post>(`/api/posts/${id}`)
      .then(({ data }) => {
        setPost(data)
        reset({ title: data.title, description: data.description })
      })
      .catch(() => toast.error("Failed to load post"))
      .finally(() => setIsLoading(false))
  }, [id, reset])


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
      <div className="flex justify-center items-center min-h-screen">
        <Spinner className="size-6" />
      </div>
    )
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

      <CommentsSection postId={id as string} />
    </div>
  );
}
