import Bun, { Glob } from "bun";
import fs from "fs/promises";
import markdownit from "markdown-it";

import { logger } from "../../cli";
import { zaapConfig } from "../config/zzapConfig";

export const zzapBundler = {
  async generate() {
    const config = await zaapConfig.get();
    logger.info(`Building ${config.siteTitle}...`);

    // Clean output folder
    const filesNotToRemoveDuringOuputFolderCleanup = [
      config.outputFolder + "/zzap-styles/tailwind.css",
    ];

    for await (const path of new Glob(config.outputFolder + "/**/*").scan({
      cwd: ".",
    })) {
      if (!filesNotToRemoveDuringOuputFolderCleanup.includes(path)) {
        await fs.rm(path);
      }
    }

    const timestampMs = Date.now();
    const md = markdownit({
      html: true,
      linkify: true,
    });

    // Copy CSS files
    for (const file of config.cssFiles || []) {
      const css = await Bun.file(file.path).text();
      const fileName = file.fileName || file.path.split("/").pop();
      await Bun.write(`./${config.outputFolder}/zzap-styles/` + fileName, css);
    }

    // Copy Favicon
    const favicon = await Bun.file(config.favicon.path);
    await Bun.write(`./${config.outputFolder}/${favicon.name}`, favicon);

    // Make ClientJS
    await Bun.build({
      entrypoints: ["./zzap.content.tsx"],
      target: "browser",
      format: "esm",
      outdir: "./dist/zzap-scripts",
    });

    // Render Pages with Glob
    let globFileCount = 0;
    const globPatterns = config.globPatterns || ["**/*.mdx", "**/*.md"];

    const head = (
      <>
        {config.tailwind && (
          <link rel="stylesheet" href="/zzap-styles/tailwind.css" />
        )}
      </>
    );

    const scripts = (
      <>
        <script src="/zzap-scripts/zzap.content.js"></script>
      </>
    );

    for (const pattern of globPatterns) {
      const glob = new Glob(config.contentFolder + "/" + pattern);

      const filesIterator = glob.scan({
        cwd: ".",
        onlyFiles: true,
      });

      logger.info(`Rendering pages with pattern: ${pattern}`);

      for await (const filePath of filesIterator) {
        const pageMarkdown = await Bun.file(filePath).text();

        const path = filePath
          .replace(config.contentFolder, "")
          .replace(/\.mdx?$/, "")
          .replace(/\.md?$/, "")
          .replace(/\/index$/, "");

        const pageHTML = md.render(pageMarkdown);

        const content = config.body({
          children: (
            <div
              dangerouslySetInnerHTML={{
                __html: pageHTML,
              }}
            ></div>
          ),
        });

        const root = <div id="zzap-root">{content}</div>;

        const jsx = config.document({
          head: head,
          children: root,
          scripts: (
            <>
              <script
                dangerouslySetInnerHTML={{
                  __html: `
window.__zzap = ${JSON.stringify({
                    props: content.props,
                  })};`,
                }}
              ></script>
              {scripts}
            </>
          ),
        });
        const html = config.react.Server.renderToString(jsx);
        Bun.write(`${config.outputFolder}/${path}/index.html`, html);
        globFileCount++;
      }
    }

    // Render dynamic pages
    const dynamicPages: Array<{ path: string; children: JSX.Element }> = [];
    if (config.dynamic) {
      await config.dynamic({
        addPage(props) {
          dynamicPages.push(props);
        },
      });

      for (const page of dynamicPages) {
        const jsx = config.document({
          head: head,
          children: page.children,
          scripts: scripts,
        });
        const html = config.react.Server.renderToString(jsx);
        Bun.write(`${config.outputFolder}/${page.path}/index.html`, html);
      }
    }

    const timeDiff = Date.now() - timestampMs;
    logger.info(
      `Site built in ${timeDiff}ms with ${globFileCount} glob pages and ${dynamicPages.length} dynamic pages.`,
    );
  },
};
