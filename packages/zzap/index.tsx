import { zzapPluginPicoCSS } from "./plugins/zzapPluginPicoCSS";
import { zzapPluginTailwind } from "./plugins/zzapPluginTailwind";

export { defineConfig } from "./src/domains/config/zzapConfigSchema";
export { definePlugin } from "./src/domains/plugin/definePlugin";

export const plugins = {
  tailwind: zzapPluginTailwind,
  picoCSS: zzapPluginPicoCSS,
};
