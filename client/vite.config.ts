import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import sitemapPlugin from "vite-plugin-sitemap";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    sitemapPlugin({
      hostname: "https://mellow-tools.vercel.app/",
      dynamicRoutes: [
        "/dashboard",
        "/auth",
        "/update-password",
        "/text-templates",
        "/text-templates/create",
        "/notes",
        "/bookmarks",
        "/job-tracker",
      ],
    }),
  ],
});
