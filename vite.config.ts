import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  base: "/forest/",
  plugins: [
    react(),
    svgr({
      // Rolldown Vite specific configuration
      svgrOptions: {
        exportType: "named",
        namedExport: "ReactComponent",
      },
      include: "**/*.svg",
      exclude: "",
    }),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  // Ensure SVG imports work correctly
  assetsInclude: ["**/*.svg"],
});
