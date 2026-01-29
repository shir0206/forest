import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  base: "/",
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
  // Ensure SVG imports work correctly
  assetsInclude: ["**/*.svg"],
});
