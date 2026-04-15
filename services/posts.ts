import "@/lib/db";
import Post from "@/models/Post";
import User from "@/models/User";

async function paginatePosts(
  filter: Record<string, unknown>,
  page: number,
  limit: number,
) {
  const [posts, total] = await Promise.all([
    Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Post.countDocuments(filter),
  ]);
  return { posts, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getPostsByUser(
  userId: string,
  page: number,
  limit: number,
) {
  return paginatePosts({ userId }, page, limit);
}

export async function getAllPostsExcluding(
  page: number,
  limit: number,
  excludeUserId?: string,
) {
  const filter: Record<string, unknown> = excludeUserId
    ? { userId: { $ne: excludeUserId } }
    : {};
  const { posts, total, totalPages } = await paginatePosts(filter, page, limit);

  const userIds = [...new Set(posts.map((p) => p.userId))];
  const users = await User.find({ _id: { $in: userIds } })
    .select("_id name")
    .lean();
  const userMap = Object.fromEntries(
    users.map((u) => [
      String(u._id),
      (u as { _id: unknown; name: string }).name,
    ]),
  );

  return {
    posts: posts.map((p) => ({
      ...p,
      authorName: userMap[p.userId] ?? "Unknown",
    })),
    total,
    page,
    totalPages,
  };
}

export async function getPostById(id: string, userId: string) {
  return Post.findOne({ _id: id, userId });
}

export async function getPostByIdPublic(id: string) {
  return Post.findById(id);
}

export async function createPost(
  userId: string,
  title: string,
  description: string,
) {
  return Post.create({ userId, title, description });
}

export async function updatePost(
  id: string,
  userId: string,
  title: string,
  description: string,
) {
  return Post.findOneAndUpdate(
    { _id: id, userId },
    { title, description },
    { new: true },
  );
}

export async function deletePost(id: string, userId: string) {
  return Post.findOneAndDelete({ _id: id, userId });
}

export async function toggleLike(postId: string, userId: string) {
  const post = await Post.findById(postId);
  if (!post) return null;

  const alreadyLiked = post.likes.includes(userId);
  if (alreadyLiked) {
    post.likes = post.likes.filter((id) => id !== userId);
  } else {
    post.likes.push(userId);
  }
  await post.save();
  return post;
}
