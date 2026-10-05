import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://morganesmith.website",
  output: "static",
  trailingSlash: "never",
  build: { format: "file" },
});
