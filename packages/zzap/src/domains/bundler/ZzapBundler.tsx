import Bun, { $ } from "bun";

import type { ZzapConfigType } from "../config/zzapConfigSchema";
import { getLogger } from "../logging/getLogger";
import {
  PageBuilder,
  type PluginPageType,
  type SitemapItemType,
} from "../page/ZzapPageBuilder";
import { zzapPluginCommands } from "./core-plugins/zzapPluginCommands";
import { zzapPluginHeads } from "./core-plugins/zzapPluginHeads";
import { zzapPluginPageRenderer } from "./core-plugins/zzapPluginPageRenderer";
import { zzapPluginPublicDir } from "./core-plugins/zzapPluginPublicDir";
import { zzapPluginPublicFiles } from "./core-plugins/zzapPluginPublicFiles";
import { zzapPluginScripts } from "./core-plugins/zzapPluginScripts";
import { zzapPluginSitemapRenderer } from "./core-plugins/zzapPluginSitemapRenderer";

const logger = getLogger();

export const ZzapBundler = {
  async generate(props: { config: ZzapConfigType; paths?: string[] }) {
    const buildingLabel = !props.paths
      ? `Building ${props.config.title}...`
      : `Rebuilding "${props.paths.join(", ")}"`;
    logger.log(buildingLabel);
    const timetamp = Date.now();

    const { heads, scripts } = await runLoaderPlugins({
      config: props.config,
    });

    const pages = new Map<string, PluginPageType>();

    const staticPaths = await getPaths({
      config: props.config,
    });
    const paths = [...staticPaths, ...(props.paths || [])];

    const promises = paths.map(async (path) => {
      // Check for Markdown files
      const filePath = props.config.srcDir + path + ".md";
      const indexFilePath = props.config.srcDir + path + "/index.md";
      const pathForExploded = path.split("/").slice(0, -1).join("/");
      const explodeFilePath = props.config.srcDir + pathForExploded + "/!.md";

      let file = Bun.file(filePath);
      let exists = await file.exists();

      if (!exists) {
        file = Bun.file(indexFilePath);
        exists = await file.exists();
      }

      if (!exists) {
        file = Bun.file(explodeFilePath);
        exists = await file.exists();
      }

      if (exists) {
        const pageMarkdown = await file.text();
        const markdownPages = await PageBuilder.fromMarkdown({
          config: props.config as any,
          path: path,
          markdown: pageMarkdown,
        });

        markdownPages.forEach((page) => {
          pages.set(page.path, page);
        });
      }
    });
    await Promise.all(promises);

    const siteMap: Array<SitemapItemType> = Array.from(pages)
      .map(([_path, page]) => {
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
      pages: Array.from(pages.values()),
      sitemap: siteMap,
    });

    logger.log(
      `Finished building ${props.config.title} in ${Date.now() - timetamp}ms.`,
    );
  },
};

async function getPaths(props: { config: ZzapConfigType }) {
  const paths: Array<string> = [];

  // MARKDOWN
  const globPatterns = ["**/*.md", "**/*.mdx"];
  for (const pattern of globPatterns) {
    const glob = new Bun.Glob(props.config.srcDir + "/" + pattern);

    const filesIterator = glob.scan({
      cwd: ".",
      onlyFiles: true,
    });

    for await (const filePath of filesIterator) {
      const path = filePath
        .replace(props.config.srcDir, "")
        .replace(/\.mdx?$/, "")
        .replace(/\.md?$/, "")
        .replace(/\/index$/, "");

      paths.push(path);
    }
  }

  // DYNAMIC

  return paths;
}

async function runLoaderPlugins(props: { config: ZzapConfigType }) {
  const heads: Array<JSX.Element> = [];
  const scripts: Array<JSX.Element> = [];

  const allPlugins = [
    zzapPluginHeads(),
    zzapPluginScripts(),
    zzapPluginCommands(),
    zzapPluginPublicDir(),
    zzapPluginPublicFiles(),

    ...props.config.plugins,
  ];
  const pluginDoneLogs: Array<{ name: string; log: () => void }> = [];
  logger.debug(`Running loaders...`);
  const pluginPromises = allPlugins.map(async (plugin) => {
    if (!plugin.loader) return;
    const timestamp = Date.now();
    const pluginLogger = getLogger(`[loader] ▶ ${plugin.name}`);
    const loaderResult = await plugin.loader({
      $,
      Bun,
      logger: pluginLogger,
      config: props.config,
    });
    const newHeads = loaderResult?.heads || [];
    const newScripts = loaderResult?.scripts || [];
    heads.push(...newHeads);
    scripts.push(...newScripts);

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
        pluginLogger.debug(`Done in ${doneTimestamp}ms.`);
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
  logger.debug(`Running processors...`);
  const pluginPromises = allPlugins.map(async (plugin) => {
    if (!plugin.processor) return;
    const timestamp = Date.now();
    const pluginLogger = getLogger(`[processor] ▶ ${plugin.name}`);
    await plugin.processor({
      $,
      Bun,
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
        pluginLogger.debug(`Done in ${doneTimestamp}ms.`);
      },
    });
  });

  await Promise.all(pluginPromises);

  pluginDoneLogs.forEach(({ log }) => {
    log();
  });
}
