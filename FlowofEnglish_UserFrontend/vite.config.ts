import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  // base: "./",
  plugins: [react()],
  build: {
    target: "modules",
    outDir: path.resolve(__dirname, "./dist"),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
