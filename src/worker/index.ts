import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import {
  CreateRestaurantSchema,
  CreateReviewSchema,
  UpdateProfileSchema,
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "@/shared/types";
import type { AppUser } from "@/shared/types";
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  roleForEmail,
  SESSION_COOKIE,
  SESSION_DURATION_DAYS,
} from "./auth";
import { authMiddleware, requireStaff } from "./middleware";

type Variables = { user: AppUser };

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

interface Restaurant {
  id: string;
  name: string;
  city: string;
  district: string;
  foodType: string;
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
  comment: string;
  added_by: string;
  added_by_avatar: string | null;
  added_by_id: string | null;
  created_at: string;
  lat: number;
  lng: number;
  photo_url: string | null;
  average_rating?: number | null;
  review_count?: number | null;
}

function mapRestaurant(row: RestaurantRow): Restaurant {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    district: row.district,
    foodType: row.food_type,
    comment: row.comment,
    addedBy: row.added_by,
    addedByAvatar: row.added_by_avatar ?? undefined,
    createdAt: row.created_at,
    lat: row.lat,
    lng: row.lng,
    photoUrl: row.photo_url ?? undefined,
    averageRating: row.average_rating ?? undefined,
    reviewCount: row.review_count ?? 0,
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
  const role = roleForEmail(email);

  await c.env.DB.prepare(
    "INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)"
  )
    .bind(id, name, email.toLowerCase(), passwordHash, role)
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
    role,
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

// Forgot password — always responds with a generic message to avoid leaking which emails are registered
app.post("/api/auth/forgot-password", zValidator("json", ForgotPasswordSchema), async (c) => {
  const { email } = c.req.valid("json");

  const user = await c.env.DB.prepare("SELECT id FROM users WHERE email = ?")
    .bind(email.toLowerCase())
    .first<{ id: string }>();

  if (user) {
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    await c.env.DB.prepare(
      "INSERT INTO password_reset_tokens (token, user_id, expires_at) VALUES (?, ?, ?)"
    )
      .bind(token, user.id, expiresAt)
      .run();

    const origin = new URL(c.req.url).origin;
    const resetLink = `${origin}/#/reset-password?token=${token}`;

    if (c.env.RESEND_API_KEY) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${c.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Sahanın Gurmeleri <onboarding@resend.dev>",
            to: [email],
            subject: "Şifre Sıfırlama Talebi",
            html: `<p>Merhaba,</p><p>Şifreni sıfırlamak için <a href="${resetLink}">bu bağlantıya</a> tıkla. Bağlantı 1 saat geçerlidir.</p><p>Bu talebi sen yapmadıysan bu e-postayı yok sayabilirsin.</p>`,
          }),
        });
      } catch (err) {
        console.error("Resend email error:", err);
      }
    } else {
      console.warn("RESEND_API_KEY tanımlı değil, şifre sıfırlama e-postası gönderilemedi:", resetLink);
    }
  }

  return c.json({
    success: true,
    message: "E-posta adresiniz kayıtlıysa şifre sıfırlama bağlantısı gönderildi.",
  });
});

app.post("/api/auth/reset-password", zValidator("json", ResetPasswordSchema), async (c) => {
  const { token, password } = c.req.valid("json");

  const record = await c.env.DB.prepare(
    "SELECT user_id, expires_at, used FROM password_reset_tokens WHERE token = ?"
  )
    .bind(token)
    .first<{ user_id: string; expires_at: string; used: number }>();

  if (!record || record.used || new Date(record.expires_at).getTime() < Date.now()) {
    throw new HTTPException(400, { message: "Geçersiz veya süresi dolmuş bağlantı" });
  }

  const passwordHash = await hashPassword(password);
  await c.env.DB.prepare("UPDATE users SET password_hash = ? WHERE id = ?")
    .bind(passwordHash, record.user_id)
    .run();
  await c.env.DB.prepare("UPDATE password_reset_tokens SET used = 1 WHERE token = ?")
    .bind(token)
    .run();
  await c.env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(record.user_id).run();

  return c.json({ success: true });
});

// Get current user
app.get("/api/auth/me", authMiddleware, (c) => {
  return c.json(c.get("user"));
});

// List users (for @ tagging in comments)
app.get("/api/users", authMiddleware, async (c) => {
  const result = await c.env.DB.prepare(
    "SELECT id, name FROM users ORDER BY name ASC"
  ).all<{ id: string; name: string }>();
  return c.json(result.results);
});

interface NotificationRow {
  id: string;
  restaurant_id: string | null;
  review_id: string | null;
  actor_name: string;
  message: string;
  is_read: number;
  created_at: string;
}

app.get("/api/notifications", authMiddleware, async (c) => {
  const user = c.get("user");
  const result = await c.env.DB.prepare(
    `SELECT id, restaurant_id, review_id, actor_name, message, is_read, created_at
     FROM notifications WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT 30`
  )
    .bind(user.id)
    .all<NotificationRow>();

  return c.json(
    ((result.results ?? []) as NotificationRow[]).map((n) => ({
      id: n.id,
      restaurantId: n.restaurant_id ?? undefined,
      reviewId: n.review_id ?? undefined,
      actorName: n.actor_name,
      message: n.message,
      read: !!n.is_read,
      createdAt: n.created_at,
    }))
  );
});

app.post("/api/notifications/:id/read", authMiddleware, async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  await c.env.DB.prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?")
    .bind(id, user.id)
    .run();
  return c.json({ success: true });
});

app.post("/api/notifications/read-all", authMiddleware, async (c) => {
  const user = c.get("user");
  await c.env.DB.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0")
    .bind(user.id)
    .run();
  return c.json({ success: true });
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
  try {
    const result = await c.env.DB.prepare(
      `SELECT r.id, r.name, r.city, r.district, r.food_type, r.comment,
              r.added_by, r.added_by_avatar, r.added_by_id, r.created_at, r.lat, r.lng, r.photo_url,
              AVG(rv.rating) AS average_rating, COUNT(rv.id) AS review_count
       FROM restaurants r
       LEFT JOIN reviews rv ON rv.restaurant_id = r.id
       GROUP BY r.id
       ORDER BY datetime(r.created_at) DESC`
    ).all();

    return c.json((result.results as RestaurantRow[]).map(mapRestaurant));
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    throw new HTTPException(500, { message: "Restoranlar yüklenemedi" });
  }
});

app.get("/api/restaurants/:id/reviews", async (c) => {
  const restaurantId = c.req.param("id");

  const restaurant = await c.env.DB.prepare("SELECT id FROM restaurants WHERE id = ?")
    .bind(restaurantId)
    .first<{ id: string }>();

  if (!restaurant) {
    throw new HTTPException(404, { message: "Restoran bulunamadı" });
  }

  interface ReviewRow {
    id: string;
    restaurant_id: string;
    rating: number;
    comment: string;
    added_by: string;
    added_by_avatar: string | null;
    created_at: string;
    photo_url: string | null;
  }

  const reviews = await c.env.DB.prepare(
    `SELECT id, restaurant_id, rating, comment, added_by, added_by_avatar, created_at, photo_url
     FROM reviews
     WHERE restaurant_id = ?
     ORDER BY datetime(created_at) DESC`
  )
    .bind(restaurantId)
    .all<ReviewRow>();

  return c.json(
    (reviews.results as ReviewRow[]).map((r) => ({
      id: r.id,
      restaurantId: r.restaurant_id,
      rating: r.rating,
      comment: r.comment,
      addedBy: r.added_by,
      addedByAvatar: r.added_by_avatar ?? undefined,
      createdAt: r.created_at,
      photoUrl: r.photo_url ?? undefined,
    }))
  );
});

app.post(
  "/api/restaurants/:id/reviews",
  authMiddleware,
  zValidator("json", CreateReviewSchema),
  async (c) => {
    const restaurantId = c.req.param("id");
    const body = c.req.valid("json");
    const user = c.get("user");

    const restaurant = await c.env.DB.prepare("SELECT id, name FROM restaurants WHERE id = ?")
      .bind(restaurantId)
      .first<{ id: string; name: string }>();

    if (!restaurant) {
      throw new HTTPException(404, { message: "Restoran bulunamadı" });
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
        id, restaurant_id, rating, comment, added_by, added_by_avatar, created_at, photo_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        reviewId,
        restaurantId,
        body.rating,
        body.comment,
        user.name,
        user.avatar_url ?? null,
        createdAt,
        body.photoUrl || null
      )
      .run();

    const allUsers = await c.env.DB.prepare("SELECT id, name FROM users").all<{ id: string; name: string }>();
    const commentLower = body.comment.toLowerCase();
    const mentioned = ((allUsers.results ?? []) as { id: string; name: string }[]).filter(
      (u) => u.id !== user.id && commentLower.includes(`@${u.name.toLowerCase()}`)
    );

    for (const target of mentioned) {
      await c.env.DB.prepare(
        `INSERT INTO notifications (id, user_id, restaurant_id, review_id, actor_name, message, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          crypto.randomUUID(),
          target.id,
          restaurantId,
          reviewId,
          user.name,
          `${user.name}, "${restaurant.name}" için yaptığı yorumda seni etiketledi.`,
          createdAt
        )
        .run();
    }

    return c.json({
      id: reviewId,
      restaurantId,
      rating: body.rating,
      comment: body.comment,
      addedBy: user.name,
      addedByAvatar: user.avatar_url ?? null,
      createdAt,
      photoUrl: body.photoUrl || undefined,
    }, 201);
  }
);

const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

app.post("/api/upload", authMiddleware, async (c) => {
  const form = await c.req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return c.json({ error: "Dosya bulunamadı" }, 400);
  }
  if (!ALLOWED_PHOTO_TYPES.has(file.type)) {
    return c.json({ error: "Yalnızca JPEG, PNG, WEBP veya HEIC fotoğraf yükleyebilirsiniz" }, 400);
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return c.json({ error: "Dosya boyutu 8MB'ı geçemez" }, 400);
  }

  const ext = file.type.split("/")[1] ?? "jpg";
  const key = `${crypto.randomUUID()}.${ext}`;
  await c.env.PHOTOS.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  return c.json({ url: `/api/photos/${key}` }, 201);
});

app.get("/api/photos/:key", async (c) => {
  const key = c.req.param("key");
  const object = await c.env.PHOTOS.get(key);
  if (!object) {
    return c.notFound();
  }
  return new Response(object.body, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
});

app.post(
  "/api/restaurants",
  authMiddleware,
  requireStaff,
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
      comment: body.comment,
      addedBy: user.name,
      addedByAvatar: user.avatar_url ?? undefined,
      createdAt: new Date().toISOString(),
      lat: body.lat ?? 0,
      lng: body.lng ?? 0,
      photoUrl: body.photoUrl || undefined,
      averageRating: undefined,
      reviewCount: 0,
    };

    await c.env.DB.prepare(
      `INSERT INTO restaurants (
        id, name, city, district, food_type, comment, added_by,
        added_by_avatar, added_by_id, created_at, lat, lng, photo_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        newRestaurant.id,
        newRestaurant.name,
        newRestaurant.city,
        newRestaurant.district,
        newRestaurant.foodType,
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
