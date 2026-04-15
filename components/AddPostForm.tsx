"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { toast } from "sonner"
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Content is required"),
  image: z
    .custom<FileList>()
    .optional()
    .refine(
      (files) => !files || files.length === 0 || files[0].size <= MAX_FILE_SIZE,
      "Image must be 5 MB or less",
    )
    .refine(
      (files) =>
        !files ||
        files.length === 0 ||
        ACCEPTED_IMAGE_TYPES.includes(files[0].type),
      "Only JPEG, PNG, GIF, and WebP images are allowed",
    ),
});

type PostFormValues = z.infer<typeof schema>

interface AddPostFormProps {
  onPostAdded: () => void
}

export function AddPostForm({ onPostAdded }: AddPostFormProps) {
  const [fileInputKey, setFileInputKey] = useState(0);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PostFormValues>({ resolver: zodResolver(schema) })

  const { ref: imageRef, ...imageRest } = register("image");

  const onSubmit = useCallback(
    async (values: PostFormValues) => {
      try {
        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("description", values.description);
        if (values.image && values.image.length > 0) {
          formData.append("image", values.image[0]);
        }
        await axios.post("/api/posts", formData);
        toast.success("Post published!");
        reset();
        setFileInputKey((k) => k + 1);
        onPostAdded();
      } catch (err) {
        if (axios.isAxiosError(err)) {
          toast.error(err.response?.data?.error ?? "Failed to publish post");
        }
      }
    },
    [reset, onPostAdded],
  );

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
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="image">Image (optional)</Label>
            <Input
              key={fileInputKey}
              id="image"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              {...imageRest}
              ref={imageRef}
            />
            {errors.image && (
              <p className="text-sm text-destructive">
                {errors.image.message as string}
              </p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Publishing…" : "Publish"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
