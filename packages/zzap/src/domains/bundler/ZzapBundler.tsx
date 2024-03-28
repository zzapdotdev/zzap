import Bun, { $ } from "bun";

import { logger } from "../../cli";
import type { zzapConfigType } from "../config/zzapConfigSchema";
import { getLogger } from "../logging/getLogger";
import {
  type SitemapItemType,
  type ZzapClientPageType,
  type ZzapPluginPageType,
} from "../page/ZzapPageBuilder";
import { ZzapRenderer } from "../renderer/ZzapRenderer";
import { zzapPluginCommands } from "./core-plugins/zzapPluginCommands";
import { zzapPluginHeads } from "./core-plugins/zzapPluginHeads";
import { zzapPluginMarkdown } from "./core-plugins/zzapPluginMarkdown";
import { zzapPluginPublicDir } from "./core-plugins/zzapPluginPublicDir";
import { zzapPluginPublicFiles } from "./core-plugins/zzapPluginPublicFiles";
import { zzapPluginScripts } from "./core-plugins/zzapPluginScripts";

export const ZzapBundler = {
  async generate(props: { config: zzapConfigType }) {
    logger.log(`Building ${props.config.title}...`);
    const timetamp = Date.now();

    const { heads, scripts, pages } = await runPlugins({
      config: props.config,
    });

    const sitemapItems: Array<SitemapItemType> = pages
      .map((page) => {
        return {
          path: page.path,
          title: page.title,
        };
      })
      .sort((a, b) => {
        const numberOfSlugsA = a.path.split("/").length;
        const numberOfSlugsB = b.path.split("/").length;

        if (numberOfSlugsA < numberOfSlugsB) return -1;
        if (numberOfSlugsA > numberOfSlugsB) return 1;

        return 0;
      });

    const clientPages = pages.map((p): ZzapClientPageType => {
      return {
        title: p.title,
        path: p.path,
        template: p.template || "default",
        data: p.data,
        type: p.type,
        description: p.description,
        html: p.html,
        sitemap: sitemapItems,
        titleWithSiteTitle: `${p.title} • ${props.config.title}`,
      };
    });

    const renderingTimestamp = Date.now();
    await ZzapRenderer.renderAndWritePages({
      config: props.config,
      heads,
      scripts,
      pages: clientPages,
    });

    await ZzapRenderer.renderAndWriteSitemap({
      config: props.config,
      sitemapItems,
    });

    logger.log(
      `Rendered ${pages.length} pages in ${Date.now() - renderingTimestamp}ms.`,
    );
    logger.log(`Finished in ${Date.now() - timetamp}ms.`);
  },
};

async function runPlugins(props: { config: zzapConfigType }) {
  const heads: Array<JSX.Element> = [];
  const scripts: Array<JSX.Element> = [];
  const pages: Array<ZzapPluginPageType> = [];

  const allPlugins = [
    zzapPluginHeads(),
    zzapPluginScripts(),
    zzapPluginCommands(),
    zzapPluginPublicDir(),
    zzapPluginPublicFiles(),
    zzapPluginMarkdown(),
    ...props.config.plugins,
  ];
  const pluginDoneLogs: Array<{ name: string; log: () => void }> = [];
  const pluginPromises = allPlugins.map(async (plugin) => {
    const timestamp = Date.now();
    const pluginLogger = getLogger(plugin.name);
    const loaderResult = await plugin.loader({
      $,
      Bun,
      logger: pluginLogger,
      config: props.config as (typeof plugin.loader)["arguments"]["config"],
    });
    const newHeads = loaderResult?.heads || [];
    const newScripts = loaderResult?.scripts || [];
    const newPages = loaderResult?.pages || [];
    heads.push(...newHeads);
    scripts.push(...newScripts);
    pages.push(...newPages);

    const doneTimestamp = Date.now() - timestamp;

    pluginDoneLogs.sort((a, b) => {
      if (a.name.startsWith("core-") && b.name.startsWith("core-"))
        return a.name.localeCompare(b.name);

      if (a.name.startsWith("core-")) return -1;
      if (b.name.startsWith("core-")) return 1;
      return a.name.localeCompare(b.name);
    });
    pluginDoneLogs.push({
      name: plugin.name,
      log: () => {
        pluginLogger.log(`Done in ${doneTimestamp}ms.`);
      },
    });
  });

  await Promise.all(pluginPromises);

  pluginDoneLogs.forEach(({ log }) => {
    log();
  });

  return {
    heads,
    scripts,
    pages,
  };
}
