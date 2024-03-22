import Bun, { Glob } from "bun";
import fs from "fs/promises";
import markdownit from "markdown-it";
import { renderToString } from "react-dom/server";
import { logger } from "../../cli";
import { zaapConfig } from "../config/zzapConfig";

export const zzapBundler = {
  async generate() {
    const config = await zaapConfig.get();
    logger.info(`Building ${config.siteTitle}...`);

    // Clean output folder
    for await (const path of new Glob(config.outputFolder + "/**/*.html").scan({
      cwd: ".",
    })) {
      await fs.rm(path);
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
      await Bun.write(`./${config.outputFolder}/` + fileName, css);
    }

    // Render Pages with Glob
    let globFileCount = 0;
    const globPatterns = config.globPatterns || ["**/*.mdx", "**/*.md"];

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

        console.log("path", path);

        const pageHTML = md.render(pageMarkdown);
        const jsx = config.layout({
          head: <></>,
          children: (
            <>
              <div
                dangerouslySetInnerHTML={{
                  __html: pageHTML,
                }}
              ></div>
            </>
          ),
        });
        const html = renderToString(jsx);
        Bun.write(`${config.outputFolder}/${path}/index.html`, html);
        globFileCount++;
      }
    }

    // Render dynamic pages
    let dynamicPageCount = 0;
    if (config.dynamic) {
      const dynamicPages = await config.dynamic();
      for (const page of dynamicPages) {
        const jsx = config.layout({
          head: <></>,
          children: page.children,
        });
        const html = renderToString(jsx);
        Bun.write(`${config.outputFolder}/${page.path}/index.html`, html);
        dynamicPageCount++;
      }
    }

    const timeDiff = Date.now() - timestampMs;
    logger.info(
      `Site built in ${timeDiff}ms. ${dynamicPageCount} dynamic pages and ${globFileCount} glob pages rendered.`,
    );
  },
};
