import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPost extends Document {
  userId: string;
  title: string;
  description: string;
  likes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    likes: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Post: Model<IPost> =
  mongoose.models.Post ?? mongoose.model<IPost>("Post", PostSchema);

export default Post;
