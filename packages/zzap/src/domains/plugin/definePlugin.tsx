import Bun, { $ } from "bun";
import type { getLogger } from "../logging/getLogger";

import type { default as Server } from "react-dom/server";

export function definePlugin<TArgs extends any[]>(props: {
  plugin(...args: TArgs): {
    name: string;
    loader(context: {
      $: typeof $;
      Bun: typeof Bun;

      logger: ReturnType<typeof getLogger>;
      config: {
        title: string;
        description: string;
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
    }): Promise<
      | {
          heads?: Array<JSX.Element>;
          scripts?: Array<JSX.Element>;
        }
      | undefined
      | void
    >;
  };
}) {
  return props.plugin;
}

export type zzapDefinePluginType = ReturnType<typeof definePlugin>;
export type zzapPluginType = ReturnType<ReturnType<typeof definePlugin>>;
