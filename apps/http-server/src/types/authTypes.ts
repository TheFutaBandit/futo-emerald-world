import z from 'zod';

export const SignUpSchema = z.object({
    username: z.string(),
    password: z.string(),
    type: z.enum(["User", "Admin"]),
})

export const LogInSchema = z.object({
    username: z.string(),
    password: z.string(),
})