import mongoose, { Schema, Document, Model } from "mongoose";

export interface IComment extends Document {
  postId: string;
  userId: string;
  content: string;
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    postId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const Comment: Model<IComment> =
  mongoose.models.Comment ?? mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;
