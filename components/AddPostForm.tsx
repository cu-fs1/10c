"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Content is required"),
})

type PostFormValues = z.infer<typeof schema>

interface AddPostFormProps {
  onPostAdded: () => void
}

export function AddPostForm({ onPostAdded }: AddPostFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PostFormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: PostFormValues) {
    try {
      await axios.post("/api/posts", values)
      toast.success("Post published!")
      reset()
      onPostAdded()
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.error ?? "Failed to publish post")
      }
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>New Post</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Post title" {...register("title")} />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Content</Label>
            <Textarea
              id="description"
              placeholder="Write your post content…"
              rows={4}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Publishing…" : "Publish"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
