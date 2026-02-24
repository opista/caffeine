import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";
import pkg from "./package.json";

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: () => {
    return {
      name: "Caffeine: Keep your screen awake",
      description: "Keep your screen awake",
      version: pkg.version,
      permissions: ["activeTab", "scripting", "storage", "tabs"],
      optional_host_permissions: ["*://*/*"],
      action: {
        default_popup: "src/popup/index.html",
        default_title: "Caffeine",
      },
      background: {
        "{{chrome}}.service_worker": "src/background/index.ts",
        "{{firefox}}.scripts": ["src/background/index.ts"],
      },
      browser_specific_settings: {
        gecko: {
          data_collection_permissions: {
            required: ["none"],
          },
          id: "caffeine@opista.com",
          strict_min_version: "142.0",
        },
        gecko_android: {},
      },
    };
  },
  modules: ["@wxt-dev/module-react"],
  srcDir: "src",
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
