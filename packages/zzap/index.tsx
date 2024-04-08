import { zzapPluginPicoCSS } from "./plugins/zzapPluginPicoCSS";
import { zzapPluginTailwind } from "./plugins/zzapPluginTailwind";

export type { RouteHandlerContextType as RouteContext } from "./src/domains/route/defineRoute";

export { defineConfig } from "./src/domains/config/defineConfig";
export { definePlugin } from "./src/domains/plugin/definePlugin";
export { defineRoute } from "./src/domains/route/defineRoute";

export type { ZzapConfigType as ZzapConfig } from "./src/domains/config/zzapConfigSchema";
export type { ZzapPageProps as ZzapProps } from "./src/domains/page/ZzapPageBuilder";

export const plugins = {
  tailwind: zzapPluginTailwind,
  picoCSS: zzapPluginPicoCSS,
};
