import { $, type ServerWebSocket } from "bun";
import { watch } from "fs";
import fs from "fs/promises";
import { ZzapBundler } from "../bundler/ZzapBundler";
import type { ZzapConfigType } from "../config/zzapConfigSchema";
import { getLogger } from "../logging/getLogger";
export let generatingPromise: ReturnType<typeof $> | undefined;

const logger = getLogger();

// let lastServedPath = "";
export const ZzapCommander = {
  async watch(props: { port: number | undefined; config: ZzapConfigType }) {
    await ZzapBundler.generate({ config: props.config, paths: [] });
    let websocket: ServerWebSocket<unknown> | undefined;
    const zzapWatcher: Parameters<typeof watch>["1"] = (_event, filename) => {
      if (generatingPromise || !filename) {
        return;
      }

      if (filename === ".DS_Store") {
        return;
      }

      logger.debug(`File changed: ${filename}`);

      websocket?.send("zzap:reload");
    };

    const srcWatcher = watch(
      props.config.srcDir,
      { recursive: true },
      zzapWatcher,
    );
    const configWatcher = watch(
      props.config.rootDir + "/zzap.config.tsx",
      { recursive: true },
      zzapWatcher,
    );

    process.on("SIGINT", function closeWatcherWhenCtrlCIsPressed() {
      srcWatcher.close();
      configWatcher.close();
      process.exit(0);
    });

    startDevServer({
      port: props.port,
      config: props.config,
      onWebSocketOpen(ws) {
        websocket = ws;
      },
    });
  },
  async start(props: { port: number | undefined; config: ZzapConfigType }) {
    await ZzapBundler.generate({ config: props.config, paths: [] });
    startDevServer({
      port: props.port,
      config: props.config,
    });
  },
  async build(props: { config: ZzapConfigType; paths: string | undefined }) {
    const pathsArray = props.paths?.split(",");
    await ZzapBundler.generate({ config: props.config, paths: pathsArray });
  },
  async clean(props: { config: ZzapConfigType }) {
    await fs.rm(props.config.outputDir, { recursive: true, force: true });
  },
};

function startDevServer(props: {
  port: number | undefined;
  config: ZzapConfigType;
  onWebSocketOpen?: (ws: ServerWebSocket<unknown>) => void;
}) {
  const port = props.port || 3000;
  logger.log(`zzap server running on http://localhost:${port}`);

  Bun.serve({
    port: port,
    websocket: {
      open(ws) {
        if (props.onWebSocketOpen) {
          props.onWebSocketOpen(ws);
        }
      },
      async message(_ws, _message) {},
    },
    async fetch(request, server) {
      const url = new URL(request.url);
      const pathname = url.pathname;
      const success = server.upgrade(request);
      if (success) {
        // Bun automatically returns a 101 Switching Protocols
        // if the upgrade succeeds
        return undefined;
      }

      const basePAth = props.config.base;

      if (props.config.base !== "/" && pathname === "/") {
        return new Response("", {
          status: 301,
          headers: {
            Location: basePAth,
          },
        });
      }

      const pathNameForBasepath = pathname.replace(props.config.base, "/");
      const hasFileExtension = pathNameForBasepath.split(".").length === 2;
      const fileName = hasFileExtension ? "" : "/index.html";
      const path = `${props.config.outputDir}${pathNameForBasepath}${fileName}`;

      try {
        let file = Bun.file(path);
        let exists = await file.exists();

        if (path.endsWith(".html")) {
          const pathToRebuild = pathNameForBasepath;

          await $`zzap build --paths=${pathToRebuild} --child`;

          file = Bun.file(path);
          exists = await file.exists();
        }

        if (path.endsWith("props.json")) {
          const pathToRebuild = pathNameForBasepath.replace(
            "/__zzap/data/",
            "",
          );

          await $`zzap build --paths=${pathToRebuild} --child`;

          file = Bun.file(path);
          exists = await file.exists();
        }

        if (!exists) {
          return htmlToReponse({
            html: `
                <h1>zzap watch - 404</h1>
                <p>File not found: <code>${pathNameForBasepath}</code></p>
                <p>Looked at: <code>${path}</code></p>
            `,
            status: 404,
          });
        }
        return new Response(file, {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        });
      } catch (error) {
        return htmlToReponse({
          html: `
              <h1>zzap watch - 500</h1>
              <p>Error loading <code>${pathNameForBasepath}</code></p>
              <p>Looked at: <code>${path}</code></p>
              <p>Erro: <code>${error}</code></p>
          `,
          status: 500,
        });
      }
    },
  });
}

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
