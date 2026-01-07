import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Nama harus diisi" })
    .min(3, { message: "Nama minimal 3 karakter" })
    .regex(/^[A-Za-z\s]+$/, { message: "Nama tidak boleh mengandung angka atau karakter khusus" }),
  
  email: z
    .string()
    .min(1, { message: "Email harus diisi" })
    .email({ message: "Format email tidak valid" }),
  
  phoneNumber: z
    .string()
    .min(1, { message: "Nomor telepon harus diisi" })
    .regex(/^[0-9]+$/, { message: "Nomor telepon hanya boleh berisi angka" })
    .min(10, { message: "Nomor telepon minimal 10 digit" })
    .max(15, { message: "Nomor telepon maksimal 15 digit" }),
  
  password: z
    .string()
    .min(1, { message: "Kata sandi harus diisi" })
    .min(6, { message: "Kata sandi minimal 6 karakter" }),
  
  confirmPassword: z
    .string()
    .min(1, { message: "Konfirmasi kata sandi harus diisi" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Kata sandi tidak cocok",
  path: ["confirmPassword"],
});

export type TRegisterRequest = z.infer<typeof registerSchema>;
