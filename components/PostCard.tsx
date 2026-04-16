import Link from "next/link"
import Image from "next/image"
import { Heart } from "lucide-react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export interface PostCardData {
  _id: string
  title: string
  createdAt: string
  imageUrl?: string | null
  likes: string[]
  authorName?: string
}

interface PostCardProps {
  post: PostCardData;
  href: string;
  currentUserId?: string;
  onLike?: (e: React.MouseEvent, postId: string) => void;
  isLiking?: boolean;
  priority?: boolean;
}

export function PostCard({
  post,
  href,
  currentUserId,
  onLike,
  isLiking,
  priority = false,
}: PostCardProps) {
  return (
    <Link href={href}>
      <Card className="hover:bg-accent transition-colors cursor-pointer overflow-hidden">
        {post.imageUrl && (
          <div className="relative w-full h-48">
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
              priority={priority}
            />
          </div>
        )}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base">{post.title}</CardTitle>
            {onLike && currentUserId ? (
              <Button
                size="sm"
                variant="ghost"
                className="h-auto p-1 shrink-0"
                onClick={(e) => onLike(e, post._id)}
                disabled={isLiking}
              >
                <Heart
                  className={`size-4 ${
                    post.likes?.includes(currentUserId)
                      ? "fill-red-500 text-red-500"
                      : "text-red-500"
                  }`}
                />
                <span className="text-xs ml-1">{post.likes?.length ?? 0}</span>
              </Button>
            ) : (
              <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                <Heart className="size-3 text-red-500" />
                {post.likes?.length ?? 0}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {post.authorName && <>{post.authorName} &middot; </>}
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </CardHeader>
      </Card>
    </Link>
  );
}
