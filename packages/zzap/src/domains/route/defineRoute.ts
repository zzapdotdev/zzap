import type { $ } from "bun";
import type { ZzapConfigType } from "../config/zzapConfigSchema";
import type { getLogger } from "../logging/getLogger";
import type { ZzapPageProps } from "../page/ZzapPageBuilder";

export function defineRoute(props: {
  getPathParams?: GetPathParamsType;
  getPage: GetPageType;
}) {
  return props;
}

export type ZzapRouteType = ReturnType<typeof defineRoute> & {
  path: string;
};

export type GetPathParamsType = (
  ctx: RouteHandlerContextType,
) => Promise<Array<{ params: Record<string, any> }> | undefined | void>;

export type GetPageType = (
  props: Record<string, any>,
  ctx: RouteHandlerContextType,
) => Promise<Omit<ZzapPageProps, "path"> | undefined | void>;

export type RouteHandlerContextType = {
  $: typeof $;
  Bun: typeof Bun;
  logger: ReturnType<typeof getLogger>;
  config: ZzapConfigType;
  markdownToPage(props: { markdown: string }): Array<ZzapPageProps>;
};
