export {};

declare global {
  interface Env {
    DB: D1Database;
    R2_BUCKET: R2Bucket;
  }
}
