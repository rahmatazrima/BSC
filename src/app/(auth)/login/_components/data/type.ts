import z, { email } from "zod";

export const schema = z.object({
    email: z.string().min(1, { message: "Email is required" }).email({ message: "Invalid email address" }),
    password: z.string().min(1, { message: "Password is required" }).min(6, { message: "Password must be at least 6 characters" }),
})

export type TLoginRequest = z.infer<typeof schema>;
