import { ZzapPluginPicoCSS } from "./plugins/pico";
import { ZzapPluginTailwind } from "./plugins/tailwind";

export { defineConfig } from "./src/domains/config/zzapConfigSchema";
export { definePlugin } from "./src/domains/plugin/definePlugin";

export const plugins = {
  tailwind: ZzapPluginTailwind,
  picoCSS: ZzapPluginPicoCSS,
};
