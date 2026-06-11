import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { CreateRestaurantSchema, RegisterSchema, LoginSchema } from "@/shared/types";
import type { AppUser } from "@/shared/types";
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  SESSION_COOKIE,
  SESSION_DURATION_DAYS,
} from "./auth";
import { authMiddleware } from "./middleware";

type Variables = { user: AppUser };

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// ─── Cookie helpers ───────────────────────────────────────────────────────────

function setSessionCookie(c: Parameters<typeof setCookie>[0], token: string) {
  // secure: false in local dev (http://), true in production (https://)
  const url = new URL(c.req.url);
  const isSecure = url.protocol === "https:";
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    path: "/",
    sameSite: "Lax",
    secure: isSecure,
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
  });
}

// ─── Auth routes ──────────────────────────────────────────────────────────────

// Register
app.post("/api/auth/register", zValidator("json", RegisterSchema), async (c) => {
  const { name, email, password } = c.req.valid("json");

  const existing = await c.env.DB.prepare("SELECT id FROM users WHERE email = ?")
    .bind(email.toLowerCase())
    .first();

  if (existing) {
    throw new HTTPException(409, { message: "Bu e-posta adresi zaten kayıtlı" });
  }

  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);

  await c.env.DB.prepare(
    "INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)"
  )
    .bind(id, name, email.toLowerCase(), passwordHash)
    .run();

  // Auto-login after register
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  await c.env.DB.prepare(
    "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)"
  )
    .bind(token, id, expiresAt)
    .run();

  setSessionCookie(c, token);

  return c.json({
    id,
    name,
    email: email.toLowerCase(),
    avatar_url: null,
    role: "member",
    created_at: new Date().toISOString(),
  } satisfies AppUser, 201);
});

// Login
app.post("/api/auth/login", zValidator("json", LoginSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  const user = await c.env.DB.prepare(
    "SELECT id, name, email, password_hash, avatar_url, role, created_at FROM users WHERE email = ?"
  )
    .bind(email.toLowerCase())
    .first<{ id: string; name: string; email: string; password_hash: string; avatar_url: string | null; role: string; created_at: string }>();

  if (!user) {
    throw new HTTPException(401, { message: "E-posta veya şifre hatalı" });
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    throw new HTTPException(401, { message: "E-posta veya şifre hatalı" });
  }

  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  await c.env.DB.prepare(
    "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)"
  )
    .bind(token, user.id, expiresAt)
    .run();

  setSessionCookie(c, token);

  const { password_hash: _, ...safeUser } = user;
  return c.json(safeUser satisfies AppUser);
});

// Get current user
app.get("/api/auth/me", authMiddleware, (c) => {
  return c.json(c.get("user"));
});

// Logout
app.post("/api/auth/logout", async (c) => {
  const token = getCookie(c, SESSION_COOKIE);
  if (token) {
    await c.env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
  }
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
  return c.json({ success: true });
});

// ─── Restaurant routes ────────────────────────────────────────────────────────

app.get("/api/restaurants", (c) => {
  // Stub data — migrate to D1 later
  return c.json(restaurants);
});

app.post(
  "/api/restaurants",
  authMiddleware,
  zValidator("json", CreateRestaurantSchema),
  (c) => {
    const body = c.req.valid("json");
    const user = c.get("user");

    const newRestaurant: Restaurant = {
      id: crypto.randomUUID(),
      name: body.name,
      city: body.city,
      district: body.district,
      foodType: body.foodType,
      rating: body.rating,
      comment: body.comment,
      addedBy: user.name,
      addedByAvatar: user.avatar_url ?? undefined,
      createdAt: new Date().toISOString(),
      lat: body.lat ?? 0,
      lng: body.lng ?? 0,
      photoUrl: body.photoUrl || undefined,
    };
    restaurants.push(newRestaurant);
    return c.json(newRestaurant, 201);
  }
);

// ─── Error handler ────────────────────────────────────────────────────────────

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }
  console.error(err);
  return c.json({ error: "Sunucu hatası" }, 500);
});

export default app;

// ─── Stub restaurant data ─────────────────────────────────────────────────────

interface Restaurant {
  id: string;
  name: string;
  city: string;
  district: string;
  foodType: string;
  rating: number;
  comment: string;
  addedBy: string;
  addedByAvatar?: string;
  createdAt: string;
  lat: number;
  lng: number;
  photoUrl?: string;
}

const restaurants: Restaurant[] = [
  {
    id: "1",
    name: "Beyti Restaurant",
    city: "İstanbul",
    district: "Florya",
    foodType: "Kebap",
    rating: 5,
    comment: "Efsanevi Beyti kebabı! Müşteri toplantıları için ideal, servis çok profesyonel.",
    addedBy: "Ahmet Yılmaz",
    createdAt: "2024-01-15T10:30:00Z",
    lat: 40.9761,
    lng: 28.7894,
    photoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400",
  },
  {
    id: "2",
    name: "Çiya Sofrası",
    city: "İstanbul",
    district: "Kadıköy",
    foodType: "Ev Yemekleri",
    rating: 5,
    comment: "Anadolu mutfağının en iyisi. Her gün değişen menü, ev yapımı tatlar.",
    addedBy: "Elif Kaya",
    createdAt: "2024-01-14T12:00:00Z",
    lat: 40.9903,
    lng: 29.0289,
    photoUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
  },
  {
    id: "3",
    name: "İmam Çağdaş",
    city: "Gaziantep",
    district: "Şahinbey",
    foodType: "Kebap",
    rating: 5,
    comment: "Antep mutfağının kalbi! Lahmacun ve kebap seçenekleri muhteşem.",
    addedBy: "Mehmet Demir",
    createdAt: "2024-01-12T14:30:00Z",
    lat: 37.0662,
    lng: 37.3833,
    photoUrl: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400",
  },
  {
    id: "4",
    name: "Tarihi Süleymaniye Hamamı Restoran",
    city: "İstanbul",
    district: "Fatih",
    foodType: "Ev Yemekleri",
    rating: 4,
    comment: "Kuru fasulye pilav efsanesi! Hızlı öğle yemeği için mükemmel.",
    addedBy: "Zeynep Arslan",
    createdAt: "2024-01-10T11:00:00Z",
    lat: 41.0162,
    lng: 28.9639,
  },
];
