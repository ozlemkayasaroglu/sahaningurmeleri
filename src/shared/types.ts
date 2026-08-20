import z from "zod";

// Fotoğraf alanları tam bir URL (https://...) veya /api/upload'ın döndürdüğü
// /api/photos/:key gibi göreli bir yol olabilir.
const PhotoUrlSchema = z
  .string()
  .refine((v) => v === "" || /^https?:\/\//.test(v) || v.startsWith("/api/photos/"), {
    message: "Geçerli bir fotoğraf değil",
  })
  .optional()
  .or(z.literal(""));

// ─── Restaurant ───────────────────────────────────────────────────────────────

export const CreateRestaurantSchema = z.object({
  name: z.string().min(1, "Restoran adı zorunludur"),
  city: z.string().min(1, "Şehir zorunludur"),
  district: z.string().min(1, "İlçe zorunludur"),
  foodType: z.string().min(1, "Yemek türü zorunludur"),
  comment: z.string().min(1, "Yorum zorunludur"),
  addedBy: z.string().min(1, "İsim zorunludur"),
  lat: z.number().optional().default(0),
  lng: z.number().optional().default(0),
  photoUrl: PhotoUrlSchema,
});

export const CreateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1, "Yorum zorunludur"),
  photoUrl: PhotoUrlSchema,
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  avatar_url: PhotoUrlSchema,
});

export type CreateRestaurantInput = z.infer<typeof CreateRestaurantSchema>;
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
});

export const LoginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta giriniz"),
  password: z.string().min(1, "Şifre zorunludur"),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Geçerli bir e-posta giriniz"),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Geçersiz bağlantı"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

// ─── User (client-safe, no password_hash) ────────────────────────────────────

export interface AppUser {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  role: string;
  created_at: string;
}
