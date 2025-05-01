import z from 'zod';

export const SignUpSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
    type: z.enum(["User", "Admin"], {
        required_error: "Type must be either 'User' or 'Admin'"
    }),
}).strict();

export const LogInSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
}).strict();