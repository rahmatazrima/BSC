import z, { email } from "zod";

export const schema = z.object({
    email: z.string().min(1, { message: "Email harus diisi" }).email({ message: "Format email tidak valid" }),
    password: z.string().min(1, { message: "Kata sandi harus diisi" }).min(6, { message: "Kata sandi minimal 6 karakter" }),
})

export type TLoginRequest = z.infer<typeof schema>;
