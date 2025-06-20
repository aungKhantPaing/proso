import { defineConfig } from "wxt";
import ui from "@nuxt/ui/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-vue"],
  srcDir: "src",
  manifest: {
    permissions: ["storage"],
    action: {
      default_popup: "src/entrypoints/popup/index.html",
    },
  },
  vite: () => ({
    plugins: [ui()],
  }),
});
