import { ZzapPluginPicoCSS } from "./plugins/zzapPluginPicoCSS";
import { ZzapPluginTailwind } from "./plugins/zzapPluginTailwind";

export { defineConfig } from "./src/domains/config/zzapConfigSchema";
export { definePlugin } from "./src/domains/plugin/definePlugin";

export const plugins = {
  tailwind: ZzapPluginTailwind,
  picoCSS: ZzapPluginPicoCSS,
};
