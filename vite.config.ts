/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react"
import path from "node:path"
import { defineConfig } from "vite"
import tailwindcss from "@tailwindcss/vite"
import icons from "unplugin-icons/vite"

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the app from /<repo-name>/. CI passes VITE_BASE from the repo name.
  base: process.env.VITE_BASE ?? "/agent-builder/",
  // Brand logos compile to inline SVG components (`~icons/<set>/<name>`): no runtime requests.
  plugins: [react(), tailwindcss(), icons({ compiler: "jsx", jsx: "react" })],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "./src") } },
  build: {
    rolldownOptions: {
      output: {
        // Long-lived vendor chunks that cache across app deploys. Route chunks come from lazy routes.
        codeSplitting: {
          groups: [
            {
              name: "react",
              test: /node_modules[\\/](react|react-dom|scheduler|react-router)[\\/]/,
              priority: 20,
            },
            { name: "vendor", test: /node_modules[\\/]/, priority: 10, entriesAware: true },
          ],
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    env: { VITE_API_MODE: "mock" },
  },
})
