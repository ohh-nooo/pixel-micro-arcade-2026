import { defineConfig } from "vite";

const repo = "nenormova-retro-gamer-nasral-2026";

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? `/${repo}/` : "/",
});
