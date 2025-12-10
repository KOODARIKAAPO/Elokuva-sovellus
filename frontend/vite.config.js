import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
  const port = Number(process.env.FRONTEND_PORT || process.env.PORT || 3000);

  return {
    plugins: [react()],
    server: {
      allowedHosts: ['localhost', 'elokuva-sovellus-front.onrender.com'],
      port: 3000,
      host: true,
    },
  };
});
