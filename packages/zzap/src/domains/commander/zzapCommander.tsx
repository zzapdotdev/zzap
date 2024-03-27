import { $ } from "bun";
import { watch } from "fs";
import fs from "fs/promises";
import { zzapBundler } from "../bundler/zzapBundler";
import { zzapConfig } from "../config/zzapConfig";
import { getLogger } from "../logging/getLogger";
export let generatingPromise: ReturnType<typeof $> | undefined;
const logger = getLogger();

export const zzapCommander = {
  async clean() {
    const config = await zzapConfig.get();
    await fs.rm(config.outputDir, { recursive: true, force: true });
  },
  async watch(props: { port: number | undefined }) {
    await zzapBundler.generate();

    const config = await zzapConfig.get();

    const watcher = watch(
      config.rootDir,
      { recursive: true },
      (_event, filename) => {
        if (generatingPromise || !filename) {
          return;
        }

        if (filename.startsWith(".zzap")) {
          return;
        }

        logger.log(`File changed: ${filename}`);

        generatingPromise = $`zzap build`;
        generatingPromise.then(() => {
          generatingPromise = undefined;
        });
      },
    );

    process.on("SIGINT", function closeWatcherWhenCtrlCIsPressed() {
      watcher.close();
      process.exit(0);
    });

    const port = props.port || 3000;
    logger.log(`zzap server running on http://localhost:${port}`);

    Bun.serve({
      port: port,
      async fetch(request) {
        const url = request.url;
        const pathname = new URL(url).pathname;
        const fileName = pathname.split(".").length > 1 ? "" : "/index.html";
        const path = `${config.outputDir}${pathname}${fileName}`;
        try {
          const file = Bun.file(path);
          const exists = await file.exists();

          if (!exists) {
            return htmlToReponse({
              html: `
                <h1>zzap watch - 404</h1>
                <p>File not found: <code>${pathname}</code></p>
                <p>Looked at: <code>${path}</code></p>
            `,
              status: 404,
            });
          }
          return new Response(Bun.file(path));
        } catch (error) {
          return htmlToReponse({
            html: `
              <h1>zzap watch - 500</h1>
              <p>Error loading <code>${pathname}</code></p>
              <p>Looked at: <code>${path}</code></p>
              <p>Erro: <code>${error}</code></p>
          `,
            status: 500,
          });
        }
      },
    });
  },
  async build() {
    await zzapBundler.generate();
  },
};

function htmlToReponse(props: { html: string; status?: number }) {
  return new Response(
    `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>zzap watch</title>
        <meta name="color-scheme" content="light dark" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.amber.min.css"
        />
      </head>
      <body>
        <main class="container">${props.html}</main>
      </body>
    </html>    
  `,
    {
      status: 404,
      headers: {
        "Content-Type": "text/html",
      },
    },
  );
}
