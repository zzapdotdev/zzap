import Bun, { $ } from "bun";

import { logger } from "../../cli";
import type { ZzapConfigType } from "../config/zzapConfigSchema";
import { getLogger } from "../logging/getLogger";
import {
  type PluginPageType,
  type SitemapItemType,
} from "../page/ZzapPageBuilder";
import { zzapPluginCommands } from "./core-plugins/zzapPluginCommands";
import { zzapPluginHeads } from "./core-plugins/zzapPluginHeads";
import { zzapPluginMarkdown } from "./core-plugins/zzapPluginMarkdown";
import { zzapPluginPageRenderer } from "./core-plugins/zzapPluginPageRenderer";
import { zzapPluginPublicDir } from "./core-plugins/zzapPluginPublicDir";
import { zzapPluginPublicFiles } from "./core-plugins/zzapPluginPublicFiles";
import { zzapPluginScripts } from "./core-plugins/zzapPluginScripts";
import { zzapPluginSitemapRenderer } from "./core-plugins/zzapPluginSitemapRenderer";

export const ZzapBundler = {
  async generate(props: { config: ZzapConfigType }) {
    logger.log(`Building ${props.config.title}...`);
    const timetamp = Date.now();

    const { heads, scripts, pages } = await runLoaderPlugins({
      config: props.config,
    });

    const siteMap: Array<SitemapItemType> = pages
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

    await runProcessorPlugins({
      config: props.config,
      heads: heads,
      scripts: scripts,
      pages: pages,
      sitemap: siteMap,
    });

    logger.log(
      `Finished building generating ${props.config.title} in ${Date.now() - timetamp}ms.`,
    );
  },
};

async function runLoaderPlugins(props: { config: ZzapConfigType }) {
  const heads: Array<JSX.Element> = [];
  const scripts: Array<JSX.Element> = [];
  const pages: Array<PluginPageType> = [];

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
  logger.log(`Running loaders...`);
  const pluginPromises = allPlugins.map(async (plugin) => {
    if (!plugin.loader) return;
    const timestamp = Date.now();
    const pluginLogger = getLogger(`[loader] ▶ ${plugin.name}`);
    const loaderResult = await plugin.loader({
      $,
      Bun,
      makePage,
      logger: pluginLogger,
      config: props.config,
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

async function runProcessorPlugins(props: {
  config: ZzapConfigType;
  heads: Array<JSX.Element>;
  scripts: Array<JSX.Element>;
  pages: Array<PluginPageType>;
  sitemap: Array<SitemapItemType>;
}) {
  const allPlugins = [
    zzapPluginSitemapRenderer(),
    zzapPluginPageRenderer(),
    ...props.config.plugins,
  ];
  const pluginDoneLogs: Array<{ name: string; log: () => void }> = [];
  const pluginPromises = allPlugins.map(async (plugin) => {
    if (!plugin.processor) return;
    const timestamp = Date.now();
    const pluginLogger = getLogger(`[processor] ▶ ${plugin.name}`);
    await plugin.processor({
      $,
      Bun,
      makePage,
      logger: pluginLogger,
      config: props.config,
      heads: props.heads,
      scripts: props.scripts,
      pages: props.pages,
      sitemap: props.sitemap,
    });
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
}

function makePage(props: {
  title: string;
  description: string;
  path: string;
  template: string;
  data: any;
  html: string;
}): PluginPageType {
  return {
    title: props.title,
    description: props.description,
    path: props.path,
    template: props.template || "default",
    type: "dynamic",
    data: props.data,
    html: props.html,
  };
}
