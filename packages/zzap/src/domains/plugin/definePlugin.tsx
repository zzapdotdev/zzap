import Bun, { $ } from "bun";
import type { getLogger } from "../logging/getLogger";

import type { ZzapConfigType } from "../config/zzapConfigSchema";
import type { PluginPageType, SitemapItemType } from "../page/ZzapPageBuilder";

export function definePlugin<TArgs extends any[]>(props: {
  plugin(...args: TArgs): {
    name: string;
    loader?(ctx: ZzapPluginContextType): Promise<
      | {
          heads?: Array<JSX.Element>;
          scripts?: Array<JSX.Element>;
          pages?: Array<PluginPageType>;
        }
      | undefined
      | void
    >;
    processor?(
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
  makePage(props: {
    title: string;
    description: string;
    path: string;
    template: string;
    data?: any;
    html?: string;
  }): PluginPageType;
  logger: ReturnType<typeof getLogger>;
  config: ZzapConfigType;
};

export type ZzapDefinePluginType = ReturnType<typeof definePlugin>;
export type ZzapPluginType = ReturnType<ReturnType<typeof definePlugin>>;
