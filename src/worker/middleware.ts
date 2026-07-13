import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { SESSION_COOKIE } from "./auth";
import type { AppUser } from "@/shared/types";

type Variables = { user: AppUser };

export const authMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE);
  if (!token) throw new HTTPException(401, { message: "Giriş yapmanız gerekiyor" });

  const now = new Date().toISOString();
  const row = await c.env.DB.prepare(
    `SELECT u.id, u.name, u.email, u.avatar_url, u.role, u.created_at
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token = ? AND s.expires_at > ?`
  )
    .bind(token, now)
    .first<AppUser>();

  if (!row) throw new HTTPException(401, { message: "Oturum süresi dolmuş" });

  c.set("user", row);
  await next();
});

export const requireStaff = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (c, next) => {
  const user = c.get("user");
  if (user.role !== "staff") {
    throw new HTTPException(403, { message: "Bu işlem için yalnızca şirket personeli yetkilidir" });
  }
  await next();
});
