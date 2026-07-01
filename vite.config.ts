import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import type { Plugin } from "vite";
// Vite plugin to integrate Express server in dev mode
const expressPlugin = (): Plugin => {
  let expressApp: any;

  return {
    name: "express-middleware",
    apply: "serve",
    async configureServer(server) {
      const { createServer: createExpressServer } = await import("./server/index");
      expressApp = createExpressServer();

      server.middlewares.use((req, res, next) => {
        // Only route /api requests to Express
        if (req.url?.startsWith("/api")) {
          expressApp(req, res, next);
        } else {
          next();
        }
      });
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: [".", "./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [expressPlugin(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));
