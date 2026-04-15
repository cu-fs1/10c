import "@/lib/db";
import Comment from "@/models/Comment";
import User from "@/models/User";

export async function getCommentsByPost(postId: string) {
  const comments = await Comment.find({ postId })
    .sort({ createdAt: 1 })
    .lean();

  const userIds = [...new Set(comments.map((c) => c.userId))];
  const users = await User.find({ _id: { $in: userIds } })
    .select("_id name")
    .lean();
  const userMap = Object.fromEntries(
    users.map((u) => [
      String(u._id),
      (u as { _id: unknown; name: string }).name,
    ])
  );

  return comments.map((c) => ({
    ...c,
    authorName: userMap[c.userId] ?? "Unknown",
  }));
}

export async function createComment(
  postId: string,
  userId: string,
  content: string
) {
  return Comment.create({ postId, userId, content });
}
