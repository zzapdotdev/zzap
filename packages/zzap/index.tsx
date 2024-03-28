import { ZzapPluginPicoCSS } from "./plugins/ZzapPluginPicoCSS";
import { ZzapPluginTailwind } from "./plugins/ZzapPluginTailwind";

export { defineConfig } from "./src/domains/config/zzapConfigSchema";
export { definePlugin } from "./src/domains/plugin/definePlugin";

export const plugins = {
  tailwind: ZzapPluginTailwind,
  picoCSS: ZzapPluginPicoCSS,
};
