import type { PluginPageType } from "../src/domains/page/ZzapPageBuilder";
import {
  definePlugin,
  type ZzapPluginContextType,
} from "../src/domains/plugin/definePlugin";

export const zzapPluginDynamic = definePlugin({
  plugin(props: {
    name: string;
    loader: (ctx: ZzapPluginContextType) => Promise<{
      pages: Array<PluginPageType>;
    } | void>;
  }) {
    return {
      name: `dynamic-${props.name}`,
      async onBuild(ctx) {
        try {
          const result = await props.loader(ctx);
          return {
            heads: [],
            scripts: [],
            pages: result?.pages ?? [],
          };
        } catch (error) {
          ctx.logger.error("loading pages", { error });
          return {
            heads: [],
            scripts: [],
            pages: [],
          };
        }
      },
    };
  },
});
