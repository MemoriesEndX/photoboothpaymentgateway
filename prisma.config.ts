import { defineConfig, env } from "prisma/config";
import "dotenv/config";

// Prisma 5's config typings may not include `seed` in every environment.
// Cast to `any` so we can provide a `seed` runner without a type error.
// Also omit the `.ts` extension in the dynamic import to satisfy the
// TypeScript compiler option that forbids explicit .ts extensions.
const config = {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
  seed: {
    run: async () => {
      // Note: omit the .ts extension so the TS compiler won't complain.
      // At runtime, Prisma will run this via Node; if you need to run
      // TypeScript seed files directly, ensure you have ts-node/register
      // or a compiled JS seed in place.
      await import("./prisma/seed"); // pastikan file seed.ts ada di folder prisma
    },
  },
// Allow using `seed` even if the library typings don't include it.
// We intentionally use `any` here; disable the explicit-any lint rule for this cast.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
} as unknown as any;

export default defineConfig(config);
