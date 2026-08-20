export {};

declare global {
  interface Env {
    DB: D1Database;
    PHOTOS: R2Bucket;
    RESEND_API_KEY?: string;
  }
}
