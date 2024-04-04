import { zzapPluginPicoCSS } from "./plugins/zzapPluginPicoCSS";
import { zzapPluginTailwind } from "./plugins/zzapPluginTailwind";
export type { RouteHandlerContextType } from "./src/domains/config/zzapConfigSchema";

export { defineConfig } from "./src/domains/config/zzapConfigSchema";
export { definePlugin } from "./src/domains/plugin/definePlugin";

export type { ZzapConfigType } from "./src/domains/config/zzapConfigSchema";
export type { ZzapPageProps as PageType } from "./src/domains/page/ZzapPageBuilder";

export const plugins = {
  tailwind: zzapPluginTailwind,
  picoCSS: zzapPluginPicoCSS,
};
