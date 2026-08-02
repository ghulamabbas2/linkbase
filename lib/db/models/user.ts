import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

// The account identity. Signup captures email + password only; `handle` is set
// later by the select-handle feature, so it is optional here (docs/database.md).
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Never selected by default — auth explicitly `.select("+passwordHash")`.
    passwordHash: { type: String, required: true, select: false },
    handle: { type: String, trim: true },
  },
  { timestamps: true },
);

// `handle` is unique when present; sparse so the many handle-less users during
// this phase don't collide on `null` (docs/database.md).
userSchema.index({ handle: 1 }, { unique: true, sparse: true });

export type UserDoc = InferSchemaType<typeof userSchema>;

// Guard registration so the model compiles once across hot reloads.
export const User: Model<UserDoc> =
  (mongoose.models.User as Model<UserDoc>) ??
  mongoose.model<UserDoc>("User", userSchema);
