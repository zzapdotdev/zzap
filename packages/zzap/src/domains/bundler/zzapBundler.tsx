import Bun, { $, Glob } from "bun";
import fs from "fs/promises";
import markdownit from "markdown-it";

import { logger } from "../../cli";
import { zaapConfig } from "../config/zzapConfig";

export const zzapBundler = {
  async generate() {
    const config = await zaapConfig.get();
    logger.log(`Building ${config.title}...`);
    const buildStartTimestamp = Date.now();

    // Clean output folder
    await fs.rm(config.outputDir, { recursive: true, force: true });

    const md = markdownit({
      html: true,
      linkify: true,
    });

    logger.debug("Waiting for tasks...");
    await Promise.all([
      publicDirTask(),
      publicFilesTask(),
      tailwindTask(),
      buildClientTask(),
      buildPages(),
    ]);

    // Render Pages with Glob
    // if (config.dynamic) {
    //   await config.dynamic({
    //     addPage(props) {
    //       dynamicPages.push(props);
    //     },
    //   });

    //   for (const page of dynamicPages) {
    //     const jsx = config.document({
    //       head: head,
    //       children: page.children,
    //       scripts: scripts,
    //     });
    //     const html = config.deps.Server.renderToString(jsx);
    //     Bun.write(`${config.outputDir}/${page.path}/index.html`, html);
    //   }
    // }

    const timeDiff = Date.now() - buildStartTimestamp;
    logger.log(`Site built in ${timeDiff}ms.`);

    async function buildPages() {
      let globFileCount = 0;
      const head = (
        <>
          {config.features?.tailwind && (
            <link rel="stylesheet" href="/zzap-styles/tailwind.css" />
          )}
        </>
      );

      const scripts = (
        <>
          <script src="/zzap-scripts/zzap.client.js"></script>
        </>
      );

      const globPatterns = ["**/*.mdx", "**/*.md"];
      for (const pattern of globPatterns) {
        const glob = new Glob(config.contentDir + "/" + pattern);

        const filesIterator = glob.scan({
          cwd: ".",
          onlyFiles: true,
        });

        for await (const filePath of filesIterator) {
          const pageMarkdown = await Bun.file(filePath).text();

          const path = filePath
            .replace(config.contentDir, "")
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
          const html = config.deps["react-dom/server"].renderToString(jsx);
          Bun.write(`${config.outputDir}/${path}/index.html`, html);
          globFileCount++;
        }
      }

      // Render dynamic pages
      const dynamicPages: Array<{ path: string; children: JSX.Element }> = [];
      return { globFileCount, dynamicPages };
    }

    async function buildClientTask() {
      await Bun.build({
        entrypoints: ["./zzap.client.tsx"],
        target: "browser",
        format: "esm",
        outdir: config.outputDir + "/zzap-scripts",
      });
      logger.debug(`buildClientTask`);
    }

    async function publicDirTask() {
      const publicDirectoryExist = await fs
        .access(config.publicDir)
        .then(() => true)
        .catch(() => false);

      if (publicDirectoryExist) {
        await fs.cp(config.publicDir, config.outputDir, { recursive: true });
      }
      logger.debug(`publicDirTask`);
    }
    async function tailwindTask() {
      if (config.features?.tailwind) {
        const { stdout, stderr, exitCode } =
          await $`tailwindcss -i ./tailwind.css -o ${config.outputDir}/zzap-styles/tailwind.css`.quiet();

        if (exitCode !== 0) {
          logger.error(Buffer.from(stdout).toString());
          logger.error(Buffer.from(stderr).toString());
        }
        logger.debug(`tailwindTask`);
      }
    }
    async function publicFilesTask() {
      const promises = config.publicFiles.map(async (file) => {
        await fs.cp(file.path, `${config.outputDir}/${file.name}`);
      });
      await Promise.all(promises);
      logger.debug(`publicFilesTask`);
    }
  },
};
