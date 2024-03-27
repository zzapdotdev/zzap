import Bun, { $, Glob } from "bun";

import React from "react";
import { logger } from "../../cli";
import { zzapConfig } from "../config/zzapConfig";
import { getLogger } from "../logging/getLogger";
import { PageBuilder, type PageType } from "../page/PageBuilder";
import { zzapPluginCommands } from "./core-plugins/zzapPluginCommands";
import { zzapPluginPublicDir } from "./core-plugins/zzapPluginPublicDir";
import { zzapPluginPublicFiles } from "./core-plugins/zzapPluginPublicFiles";
import { zzapPluginScript } from "./core-plugins/zzapPluginScript";

export const zzapBundler = {
  async generate() {
    const config = await zzapConfig.get();
    logger.log(`Building ${config.title}...`);
    const generateTimestamp = Date.now();

    const heads = [
      <style
        dangerouslySetInnerHTML={{
          __html: zzapStyles,
        }}
      />,
      <script
        type="module"
        dangerouslySetInnerHTML={{
          __html: zzapThemeManager,
        }}
      ></script>,
    ];
    const scripts: Array<JSX.Element> = [];

    await pluginsTask();

    const buildPagesTaskResult = await buildPages();
    logger.log(
      `Generated ${buildPagesTaskResult.globFileCount} pages in ${buildPagesTaskResult.time}ms.`,
    );
    logger.log(`Finished in ${Date.now() - generateTimestamp}ms.`);

    async function buildPages() {
      const timestamp = Date.now();
      let globFileCount = 0;

      const globPatterns = ["**/*.mdx", "**/*.md"];
      for (const pattern of globPatterns) {
        const glob = new Glob(config.srcDir + "/" + pattern);

        const filesIterator = glob.scan({
          cwd: ".",
          onlyFiles: true,
        });

        for await (const filePath of filesIterator) {
          const pageMarkdown = await Bun.file(filePath).text();

          const path = filePath
            .replace(config.srcDir, "")
            .replace(/\.mdx?$/, "")
            .replace(/\.md?$/, "")
            .replace(/\/index$/, "");

          const [page] = PageBuilder.fromMarkdown({
            path: path,
            markdown: pageMarkdown,
          });

          const module = await getIndexModule();
          const RootComponent = module?.default || DefaultRootComponent;
          const content = <RootComponent page={page}></RootComponent>;

          const root = <div id="zzap-root">{content}</div>;

          const jsx = config.document({
            head: (
              <>
                {heads.map((head, i) => {
                  return <React.Fragment key={i}>{head}</React.Fragment>;
                })}
              </>
            ),
            children: root,
            scripts: (
              <>
                <script
                  type="module"
                  dangerouslySetInnerHTML={{
                    __html: `
window.__zzap = ${JSON.stringify({
                      props: content.props,
                    })};`,
                  }}
                ></script>
                {scripts.map((script, i) => {
                  return <React.Fragment key={i}>{script}</React.Fragment>;
                })}
              </>
            ),
          });
          const html = config.deps["react-dom/server"].renderToString(jsx);
          Bun.write(`${config.outputDir}/${path}/index.html`, html);
          globFileCount++;
        }
      }

      // Render dynamic pages
      const dynamicPages: Array<{ path: string; children: JSX.Element }> = [];
      return { globFileCount, dynamicPages, time: Date.now() - timestamp };
    }

    async function pluginsTask() {
      const allPlugins = [
        zzapPluginScript(),
        zzapPluginCommands(),
        zzapPluginPublicDir(),
        zzapPluginPublicFiles(),
        ...config.plugins,
      ];
      const pluginDoneLogs: Array<{ name: string; log: () => void }> = [];
      const pluginPromises = allPlugins.map(async (plugin) => {
        const timestamp = Date.now();
        const pluginLogger = getLogger(plugin.name);
        const loaderResult = await plugin.loader({
          $,
          Bun,
          logger: pluginLogger,
          config: config as any,
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
            pluginLogger.log(`Done in ${doneTimestamp}ms.`);
          },
        });
      });

      await Promise.all(pluginPromises);

      pluginDoneLogs.forEach(({ log }) => {
        log();
      });
    }

    function DefaultRootComponent(props: { page: PageType }) {
      return (
        <div
          dangerouslySetInnerHTML={{
            __html: props.page.type === "markdown" ? props.page.html : "",
          }}
        ></div>
      );
    }

    async function getIndexModule(): Promise<
      { default: typeof DefaultRootComponent } | undefined
    > {
      try {
        const location = `${config.srcDir}/index.tsx`;
        const module = await import(location);
        return module;
      } catch (error) {}
      try {
        const location = `${config.srcDir}/index.jsx`;
        const module = await import(location);
        return module;
      } catch (error) {}
      return undefined;
    }
  },
};

const zzapStyles = `
#zzap-root[data-zzap-shiki="false"] pre {
  opacity: 0;
}

#zzap-root[data-zzap-shiki="true"] pre {
  opacity: 1;
  animation: fadein 0.3s;
}

@keyframes fadein {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

  `;

const zzapThemeManager = `
const themeModePreferences = window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light";
const themeMode = localStorage.getItem("zzap-theme") || themeModePreferences
  document.documentElement.setAttribute("data-zzap-theme", themeMode);
  `;
