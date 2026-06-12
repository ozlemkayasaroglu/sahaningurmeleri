import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { CreateRestaurantSchema, CreateReviewSchema, UpdateProfileSchema, RegisterSchema, LoginSchema } from "@/shared/types";
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
  averageRating?: number;
  reviewCount?: number;
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
  added_by_id: string | null;
  created_at: string;
  lat: number;
  lng: number;
  photo_url: string | null;
  average_rating: number | null;
  review_count: number;
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
    averageRating: row.average_rating ?? undefined,
    reviewCount: row.review_count,
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

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar_url: user.avatar_url,
    role: user.role,
    created_at: user.created_at,
  };

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
    `SELECT r.id, r.name, r.city, r.district, r.food_type, r.rating, r.comment,
            r.added_by, r.added_by_avatar, r.added_by_id, r.created_at, r.lat, r.lng, r.photo_url,
            AVG(rv.rating) AS average_rating,
            COUNT(rv.id) AS review_count
     FROM restaurants r
     LEFT JOIN reviews rv ON rv.restaurant_id = r.id
     GROUP BY r.id
     ORDER BY datetime(r.created_at) DESC`
  ).all<RestaurantRow>();

  return c.json(result.results.map(mapRestaurant));
});

app.get("/api/restaurants/:id/reviews", async (c) => {
  const restaurantId = c.req.param("id");

  const restaurant = await c.env.DB.prepare("SELECT id FROM restaurants WHERE id = ?")
    .bind(restaurantId)
    .first<{ id: string }>();

  if (!restaurant) {
    throw new HTTPException(404, { message: "Restoran bulunamadı" });
  }

  const reviews = await c.env.DB.prepare(
    `SELECT id, restaurant_id, rating, comment, added_by, added_by_avatar, created_at
     FROM reviews
     WHERE restaurant_id = ?
     ORDER BY datetime(created_at) DESC`
  )
    .bind(restaurantId)
    .all();

  return c.json(reviews.results);
});

app.post(
  "/api/restaurants/:id/reviews",
  authMiddleware,
  zValidator("json", CreateReviewSchema),
  async (c) => {
    const restaurantId = c.req.param("id");
    const body = c.req.valid("json");
    const user = c.get("user");

    const restaurant = await c.env.DB.prepare("SELECT id, added_by, added_by_id FROM restaurants WHERE id = ?")
      .bind(restaurantId)
      .first<{ id: string; added_by: string; added_by_id: string | null }>();

    if (!restaurant) {
      throw new HTTPException(404, { message: "Restoran bulunamadı" });
    }

    const isOwner = restaurant.added_by_id === user.id || restaurant.added_by === user.name;
    if (isOwner) {
      throw new HTTPException(403, { message: "Kendi eklediğiniz restorana yorum yapamazsınız" });
    }

    const existingReview = await c.env.DB.prepare(
      "SELECT id FROM reviews WHERE restaurant_id = ? AND added_by = ?"
    )
      .bind(restaurantId, user.name)
      .first();

    if (existingReview) {
      throw new HTTPException(409, { message: "Aynı restoran için zaten yorum yaptınız" });
    }

    const reviewId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    await c.env.DB.prepare(
      `INSERT INTO reviews (
        id, restaurant_id, rating, comment, added_by, added_by_avatar, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(reviewId, restaurantId, body.rating, body.comment, user.name, user.avatar_url ?? null, createdAt)
      .run();

    return c.json({
      id: reviewId,
      restaurantId,
      rating: body.rating,
      comment: body.comment,
      addedBy: user.name,
      addedByAvatar: user.avatar_url ?? null,
      createdAt,
    }, 201);
  }
);

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
        added_by_avatar, added_by_id, created_at, lat, lng, photo_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
        user.id,
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

app.delete(
  "/api/restaurants/:id",
  authMiddleware,
  async (c) => {
    const restaurantId = c.req.param("id");
    const user = c.get("user");

    const restaurant = await c.env.DB.prepare(
      "SELECT id, added_by, added_by_id FROM restaurants WHERE id = ?"
    )
      .bind(restaurantId)
      .first<{ id: string; added_by: string; added_by_id: string | null }>();

    if (!restaurant) {
      throw new HTTPException(404, { message: "Restoran bulunamadı" });
    }

    const isOwner = restaurant.added_by_id === user.id || restaurant.added_by === user.name;
    if (!isOwner) {
      throw new HTTPException(403, { message: "Bu restorana erişim yetkiniz yok" });
    }

    await c.env.DB.prepare("DELETE FROM reviews WHERE restaurant_id = ?").bind(restaurantId).run();
    await c.env.DB.prepare("DELETE FROM restaurants WHERE id = ?").bind(restaurantId).run();
    return c.json({ success: true });
  }
);

app.put(
  "/api/auth/me",
  authMiddleware,
  zValidator("json", UpdateProfileSchema),
  async (c) => {
    const body = c.req.valid("json");
    const user = c.get("user");

    await c.env.DB.prepare(
      `UPDATE users SET name = ?, avatar_url = ? WHERE id = ?`
    )
      .bind(body.name, body.avatar_url || null, user.id)
      .run();

    await c.env.DB.prepare(
      `UPDATE restaurants SET added_by = ?, added_by_avatar = ? WHERE added_by_id = ? OR added_by = ?`
    )
      .bind(body.name, body.avatar_url || null, user.id, user.name)
      .run();

    await c.env.DB.prepare(
      `UPDATE reviews SET added_by = ?, added_by_avatar = ? WHERE added_by = ?`
    )
      .bind(body.name, body.avatar_url || null, user.name)
      .run();

    const updatedUser = {
      ...user,
      name: body.name,
      avatar_url: body.avatar_url || null,
    };

    return c.json(updatedUser);
  }
);

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }
  console.error(err);
  return c.json({ error: "Sunucu hatası" }, 500);
});

export default app;
