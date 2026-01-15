import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

export default defineConfig({
  plugins: [react()],
  base: "/Orion_impAct/", // <--- ADD THIS (Must match your Repo Name)
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})