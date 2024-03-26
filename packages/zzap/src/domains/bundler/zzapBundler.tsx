import Bun, { $, Glob } from "bun";
import markdownit from "markdown-it";

import React from "react";
import { logger } from "../../cli";
import { zzapConfig } from "../config/zzapConfig";
import { getLogger } from "../logging/getLogger";

// Clean output folder
// await fs.rm(config.outputDir, { recursive: true, force: true });

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
    const entryPointFileNames = config.entryPoints.map(
      (entry) => entry.path.split("/").pop() as string,
    );
    const scripts = entryPointFileNames.map((fileName, i) => {
      const [fileNameWithoutExtension] = fileName.split(".");
      return (
        <script
          key={i}
          type="module"
          src={`/__zzap-scripts/${fileNameWithoutExtension}.js`}
        ></script>
      );
    });

    const md = markdownit({
      html: true,
      linkify: true,
      langPrefix: "",
    });

    const [
      publicDirTaskTime,
      publicFilesTaskTime,
      buildClientTaskTime,
      _pluginsTaskTime,
      commandsTaskTime,
    ] = await Promise.all([
      publicDirTask(),
      publicFilesTask(),
      buildClientTask(),
      pluginsTask(),
      commandsTask(),
    ]);

    logger.log(`Copied public directory in ${publicDirTaskTime}ms.`);
    logger.log(`Copied public files in ${publicFilesTaskTime}ms.`);
    logger.log(`Built client scripts in ${buildClientTaskTime}ms.`);
    logger.log(`Ran commands in ${commandsTaskTime}ms.`);

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

          const pageHTML = md.render(pageMarkdown);
          function DefaultRootComponent(props: { content: JSX.Element }) {
            return (
              <div
                dangerouslySetInnerHTML={{
                  __html: props.content,
                }}
              ></div>
            );
          }
          const RootComponent = config.RootComponent || DefaultRootComponent;
          const content = <RootComponent content={pageHTML}></RootComponent>;

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

    async function buildClientTask() {
      const timestamp = Date.now();
      const entryPoints = config.entryPoints.map((entry) => {
        return entry.path;
      });

      if (entryPoints.length) {
        await Bun.build({
          entrypoints: entryPoints,
          target: "browser",
          format: "esm",
          outdir: config.outputDir + "/__zzap-scripts",
        });
      }
      return Date.now() - timestamp;
    }

    async function publicDirTask() {
      const timestamp = Date.now();
      const publicGlob = new Glob(config.publicDir + "/**/*");

      const publicFiles = publicGlob.scan({
        cwd: ".",
        onlyFiles: true,
      });

      for await (const file of publicFiles) {
        const path = file.replace(config.publicDir, "");
        const bunFile = Bun.file(file);
        await Bun.write(`${config.outputDir}/${path}`, bunFile);
      }

      return Date.now() - timestamp;
    }
    async function commandsTask() {
      const timestamp = Date.now();
      const commandPromises = config.commands.map(async (commandProps) => {
        logger.log(`  ${commandProps.command}`);
        await $`${{ raw: commandProps.command }}`;
      });

      await Promise.all(commandPromises);
      return Date.now() - timestamp;
    }
    async function publicFilesTask() {
      const timestamp = Date.now();
      const promises = config.publicFiles.map(async (file) => {
        const bunFile = Bun.file(file.path);
        await Bun.write(`${config.outputDir}/${file.name}`, bunFile);
      });
      await Promise.all(promises);

      return Date.now() - timestamp;
    }

    async function pluginsTask() {
      const pluginPromises = config.plugins.map(async (plugin) => {
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
        pluginLogger.log(`Done in ${Date.now() - timestamp}ms.`);
        return Date.now() - timestamp;
      });

      await Promise.all(pluginPromises);
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
