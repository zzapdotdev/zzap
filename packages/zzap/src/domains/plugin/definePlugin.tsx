import Bun, { $ } from "bun";
import type { getLogger } from "../logging/getLogger";

import type { ZzapConfigType } from "../config/zzapConfigSchema";
import type { PluginPageType, SitemapItemType } from "../page/ZzapPageBuilder";

export function definePlugin<TArgs extends any[]>(props: {
  plugin(...args: TArgs): {
    name: string;
    onPrepare?(ctx: ZzapPluginContextType): Promise<void>;
    onBuild?(ctx: ZzapPluginContextType): Promise<
      | {
          heads?: Array<JSX.Element>;
          scripts?: Array<JSX.Element>;
        }
      | undefined
      | void
    >;
    onRender?(
      ctx: ZzapPluginContextType & {
        heads: Array<JSX.Element>;
        scripts: Array<JSX.Element>;
        pages: Array<PluginPageType>;
        sitemap: Array<SitemapItemType>;
      },
    ): Promise<void>;
  };
}) {
  return props.plugin;
}

export type ZzapPluginContextType = {
  $: typeof $;
  Bun: typeof Bun;

  logger: ReturnType<typeof getLogger>;
  config: ZzapConfigType;
};

export type ZzapDefinePluginType = ReturnType<typeof definePlugin>;
export type ZzapPluginType = ReturnType<ReturnType<typeof definePlugin>>;
export type ZzapPluginLifeCycleType = Exclude<keyof ZzapPluginType, "name">;
