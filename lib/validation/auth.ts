import { z } from "zod";

// Shared auth schemas (docs/errors-and-validation.md). Reused by the Server
// Actions and the client forms so the shape is declared once.

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address"));

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password"),
});

export const signUpSchema = z
  .object({
    email,
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
