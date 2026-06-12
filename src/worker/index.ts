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

interface RestaurantRow {
  id: string;
  name: string;
  city: string;
  district: string;
  food_type: string;
  rating: number;
  comment: string;
  added_by: string;
  added_by_avatar: string | null;
  created_at: string;
  lat: number;
  lng: number;
  photo_url: string | null;
}

function mapRestaurant(row: RestaurantRow): Restaurant {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    district: row.district,
    foodType: row.food_type,
    rating: row.rating,
    comment: row.comment,
    addedBy: row.added_by,
    addedByAvatar: row.added_by_avatar ?? undefined,
    createdAt: row.created_at,
    lat: row.lat,
    lng: row.lng,
    photoUrl: row.photo_url ?? undefined,
  };
}

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

app.get("/api/restaurants", async (c) => {
  const result = await c.env.DB.prepare(
    `SELECT id, name, city, district, food_type, rating, comment, added_by,
            added_by_avatar, created_at, lat, lng, photo_url
     FROM restaurants
     ORDER BY datetime(created_at) DESC`
  ).all<RestaurantRow>();

  return c.json(result.results.map(mapRestaurant));
});

app.post(
  "/api/restaurants",
  authMiddleware,
  zValidator("json", CreateRestaurantSchema),
  async (c) => {
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

    await c.env.DB.prepare(
      `INSERT INTO restaurants (
        id, name, city, district, food_type, rating, comment, added_by,
        added_by_avatar, created_at, lat, lng, photo_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        newRestaurant.id,
        newRestaurant.name,
        newRestaurant.city,
        newRestaurant.district,
        newRestaurant.foodType,
        newRestaurant.rating,
        newRestaurant.comment,
        newRestaurant.addedBy,
        newRestaurant.addedByAvatar ?? null,
        newRestaurant.createdAt,
        newRestaurant.lat,
        newRestaurant.lng,
        newRestaurant.photoUrl ?? null
      )
      .run();

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
