import Bun, { $ } from "bun";

import type { ZzapConfigType } from "../config/zzapConfigSchema";
import { getLogger } from "../logging/getLogger";
import {
  PageBuilder,
  type PluginPageType,
  type SitemapItemType,
} from "../page/ZzapPageBuilder";
import type { ZzapPluginType } from "../plugin/definePlugin";
import { zzapPluginCommands } from "./core-plugins/zzapPluginCommands";
import { zzapPluginHeads } from "./core-plugins/zzapPluginHeads";
import { zzapPluginPageRenderer } from "./core-plugins/zzapPluginPageRenderer";
import { zzapPluginPublicDir } from "./core-plugins/zzapPluginPublicDir";
import { zzapPluginPublicFiles } from "./core-plugins/zzapPluginPublicFiles";
import { zzapPluginScripts } from "./core-plugins/zzapPluginScripts";
import { zzapPluginSitemapRenderer } from "./core-plugins/zzapPluginSitemapRenderer";

const logger = getLogger();

export const ZzapBundler = {
  async prepareBuild(props: { config: ZzapConfigType }) {
    await runPluginsWithLifecycle({
      config: props.config,
      loggerPrefix: "prepare",
      async onRun({ plugin, logger }) {
        if (plugin.onPrepare) {
          await plugin.onPrepare?.({
            $,
            Bun,
            logger: logger,
            config: props.config,
          });
          return true;
        }
      },
    });
  },
  async build(props: { config: ZzapConfigType; paths: string | undefined }) {
    const timetamp = Date.now();
    const pathFromProps = props.paths?.split(",").map((path) => path.trim());

    if (!pathFromProps) {
      logger.log(`Building ${props.config.title}...`);
    } else {
      logger.log(`Rebuilding... (${props.paths})`);
    }
    const heads: Array<JSX.Element> = [];
    const scripts: Array<JSX.Element> = [];

    await runPluginsWithLifecycle({
      config: props.config,
      loggerPrefix: "build",
      async onRun({ logger, plugin }) {
        if (plugin.onBuild) {
          const result = await plugin.onBuild?.({
            $,
            Bun,
            logger: logger,
            config: props.config,
          });
          if (result) {
            heads.push(...(result.heads || []));
            scripts.push(...(result.scripts || []));
          }
          return true;
        }
      },
    });

    const paths =
      pathFromProps ||
      (await getPaths({
        config: props.config,
      }));

    const { pages, sitemap } = await getPagesAndSitemap({
      paths: paths,
      config: props.config,
    });

    await runPluginsWithLifecycle({
      config: props.config,
      loggerPrefix: "render",
      async onRun({ plugin, logger }) {
        if (plugin.onRender) {
          await plugin.onRender({
            $,
            Bun,
            logger: logger,
            config: props.config,
            heads: heads,
            scripts: scripts,
            pages: Array.from(pages.values()),
            sitemap: sitemap,
          });
          return true;
        }
      },
    });

    logger.log(`Finished in ${Date.now() - timetamp}ms.`);
  },
};

async function getPagesAndSitemap(props: {
  paths: string[];
  config: ZzapConfigType;
}) {
  const pages = new Map<string, PluginPageType>();
  const promises = props.paths.map(async (path) => {
    // Check for route
    const routes = Object.entries(props.config.routes);

    for (const [routePath, routeConfig] of routes) {
      const pathSegments = path.split("/");
      const routeSegments = routePath.split("/");

      if (pathSegments.length !== routeSegments.length) {
        continue;
      }

      const match = routeSegments.every((routeSegment, i) => {
        if (routeSegment.startsWith(":")) return true;
        return routeSegment === pathSegments[i];
      });

      if (match) {
        const params: Record<string, string> = {};

        for (const segment of routeSegments) {
          if (segment.startsWith(":")) {
            const key = segment.replace(":", "");
            const value = pathSegments[routeSegments.indexOf(segment)];
            params[key] = value;
          }
        }

        const routePage = await routeConfig.getPage({ params: params });

        pages.set(path, {
          ...routePage,
          path,
        });
      }
    }

    // Check for Markdown files
    let filePath = props.config.srcDir + path + ".md";

    let file = Bun.file(filePath);
    let exists = await file.exists();

    if (!exists) {
      filePath = props.config.srcDir + path + "/index.md";
      file = Bun.file(filePath);
      exists = await file.exists();
    }

    if (!exists) {
      const pathForExploded = path.split("/").slice(0, -1).join("/");
      filePath = props.config.srcDir + pathForExploded + "/!index.md";

      file = Bun.file(filePath);
      exists = await file.exists();
    }

    if (!exists) {
      return;
    }

    const pageMarkdown = await file.text();
    const markdownPages = await PageBuilder.fromMarkdown({
      config: props.config as any,
      path: path,
      filePath,
      markdown: pageMarkdown,
    });

    markdownPages.forEach((page) => {
      pages.set(page.path, page);
    });
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

  return { pages, sitemap: siteMap };
}

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
  const routesPromises = Object.entries(props.config.routes).map(
    async ([dynamicPath, routeConfig]) => {
      routeConfig;
      const pathParamsConfigs = await routeConfig.getPathParams?.();

      for (const pathParamsConfig of pathParamsConfigs || []) {
        let pathToAdd = dynamicPath;

        for (const [key, value] of Object.entries(pathParamsConfig.params)) {
          pathToAdd = pathToAdd.replace(`:${key}`, value);
        }

        paths.push(pathToAdd);
      }
    },
  );

  await Promise.all(routesPromises);

  return paths;
}

async function runPluginsWithLifecycle(props: {
  config: ZzapConfigType;
  loggerPrefix: string;
  onRun(props: {
    plugin: ZzapPluginType;
    logger: ReturnType<typeof getLogger>;
  }): Promise<true | undefined>;
}) {
  const allPlugins = [
    zzapPluginHeads(),
    zzapPluginScripts(),
    zzapPluginCommands(),
    zzapPluginPublicDir(),
    zzapPluginPublicFiles(),
    zzapPluginSitemapRenderer(),
    zzapPluginPageRenderer(),
    ...props.config.plugins,
  ];
  const pluginDoneLogs: Array<{ name: string; log: () => void }> = [];

  const pluginPromises = allPlugins.map(async (plugin) => {
    const timestamp = Date.now();
    const pluginLogger = getLogger(`[${props.loggerPrefix}] ▶ ${plugin.name}`);

    const ran = await props.onRun({ plugin, logger });
    if (ran) {
      const doneTimestamp = Date.now() - timestamp;
      pluginDoneLogs.push({
        name: plugin.name,
        log: () => {
          pluginLogger.debug(`Done in ${doneTimestamp}ms.`);
        },
      });
    }
  });

  await Promise.all(pluginPromises);

  pluginDoneLogs.sort((a, b) => {
    if (a.name.startsWith("core-") && b.name.startsWith("core-"))
      return a.name.localeCompare(b.name);

    if (a.name.startsWith("core-")) return -1;
    if (b.name.startsWith("core-")) return 1;
    return a.name.localeCompare(b.name);
  });

  pluginDoneLogs.forEach(({ log }) => {
    log();
  });
}
