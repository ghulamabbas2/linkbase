import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

// A single link on a user's profile: a title + destination URL, owned by the
// user who created it. `userId` scopes every read and write (docs/database.md).
const linkSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    // Display-only for now; click tracking is a later feature.
    clicks: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Every list/read is filtered by owner, newest first — index the scope column.
linkSchema.index({ userId: 1, createdAt: -1 });

export type LinkDoc = InferSchemaType<typeof linkSchema>;

// Guard registration so the model compiles once across hot reloads.
export const Link: Model<LinkDoc> =
  (mongoose.models.Link as Model<LinkDoc>) ??
  mongoose.model<LinkDoc>("Link", linkSchema);
