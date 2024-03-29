import Bun, { $ } from "bun";
import type { getLogger } from "../logging/getLogger";

import type { default as Server } from "react-dom/server";
import type { PluginPageType } from "../page/ZzapPageBuilder";

export function definePlugin<TArgs extends any[]>(props: {
  plugin(...args: TArgs): {
    name: string;
    loader(context: ZzapPluginContextType): Promise<
      | {
          heads?: Array<JSX.Element>;
          scripts?: Array<JSX.Element>;
          pages?: Array<PluginPageType>;
        }
      | undefined
      | void
    >;
    processor(
      context: ZzapPluginContextType & {
        pages: Array<PluginPageType>;
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
  config: {
    isProduction: boolean;
    title: string;
    description: string;
    base: string;
    rootDir: string;
    srcDir: string;
    outputDir: string;
    publicDir: string;
    publicFiles: Array<{
      path: string;
      name: string;
    }>;
    commands: Array<{
      command: string;
    }>;
    entryPoints: Array<{
      path: string;
    }>;
    deps: {
      "react-dom/server": typeof Server;
    };
    document(props: {
      head: Array<JSX.Element>;
      children: JSX.Element;
      scripts: Array<JSX.Element>;
    }): JSX.Element;
    RootComponent: any;
  };
};

export type zzapDefinePluginType = ReturnType<typeof definePlugin>;
export type zzapPluginType = ReturnType<ReturnType<typeof definePlugin>>;
