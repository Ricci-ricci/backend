// backend/src/schemas/auth.schema.ts
import { z } from "zod";

export const signUpSchema = z.object({
    body: z.object({
        name: z.string().min(1, { message: "Name is required" }),
        email: z.string().email("Not a valid email"),
        password: z
            .string()
            .min(6, "Password must be at least 6 characters long"),
    }),
});
