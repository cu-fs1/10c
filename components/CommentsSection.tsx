"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { useAuthStore } from "@/store/useAuthStore"
import { ClientOnly } from "@/components/ClientOnly"

interface Comment {
  _id: string;
  userId: string;
  content: string;
  authorName: string;
  createdAt: string;
}

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
});

type CommentFormValues = z.infer<typeof commentSchema>;

interface CommentsSectionProps {
  postId: string;
}

export function CommentsSection({ postId }: CommentsSectionProps) {
  const { user, hydrated } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);

  const {
    register: registerComment,
    handleSubmit: handleCommentSubmit,
    reset: resetComment,
    formState: { errors: commentErrors, isSubmitting: isCommentSubmitting },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
  });

  useEffect(() => {
    if (!hydrated) return;
    axios
      .get<Comment[]>(`/api/posts/${postId}/comments`)
      .then(({ data }) => setComments(data))
      .catch(() => {
        /* not logged in, silently skip */
      })
      .finally(() => setCommentsLoading(false));
  }, [postId, hydrated]);

  async function onCommentSubmit(values: CommentFormValues) {
    try {
      const { data } = await axios.post<Comment>(
        `/api/posts/${postId}/comments`,
        values,
      );
      setComments((prev) => [
        ...prev,
        { ...data, authorName: user?.name ?? "You" },
      ]);
      resetComment();
      toast.success("Comment added!");
    } catch (err) {
      toast.error(
        axios.isAxiosError(err)
          ? (err.response?.data?.error ?? "Failed to add comment")
          : "Failed to add comment",
      );
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h2>

      <ClientOnly>
        {user ? (
          <form
            onSubmit={handleCommentSubmit(onCommentSubmit)}
            className="flex flex-col gap-2"
          >
            <Textarea
              placeholder="Write a comment…"
              rows={3}
              {...registerComment("content")}
            />
            {commentErrors.content && (
              <p className="text-sm text-destructive">
                {commentErrors.content.message}
              </p>
            )}
            <Button
              type="submit"
              size="sm"
              className="self-end"
              disabled={isCommentSubmitting}
            >
              {isCommentSubmitting ? <Spinner className="size-4 mr-2" /> : null}
              Post comment
            </Button>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">
            <a href="/login" className="underline underline-offset-2">
              Log in
            </a>{" "}
            to leave a comment.
          </p>
        )}
      </ClientOnly>

      {commentsLoading ? (
        <div className="flex justify-center py-4">
          <Spinner className="size-5" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No comments yet. Be the first!
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {comments.map((comment) => (
            <div key={comment._id} className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium">
                  {comment.authorName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
