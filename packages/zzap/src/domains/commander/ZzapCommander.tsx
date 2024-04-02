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
  async build(props: {
    config: ZzapConfigType;
    paths: string | undefined;
    debug: boolean | undefined;
  }) {
    await this.clean({ config: props.config, debug: props.debug });
    await ZzapBundler.prepareBuild({ config: props.config });
    await ZzapBundler.build({ config: props.config, paths: props.paths });
  },
  async watch(props: {
    port: number | undefined;
    config: ZzapConfigType;
    debug: boolean | undefined;
  }) {
    let websocket: ServerWebSocket<unknown> | undefined;
    let generatingPromise: ReturnType<typeof $> | undefined;

    await this.clean({ config: props.config, debug: props.debug });
    await ZzapBundler.prepareBuild({ config: props.config });

    const zzapWatcher: Parameters<typeof watch>["1"] = (_event, filename) => {
      if (generatingPromise || !filename) {
        return;
      }

      if (filename === ".DS_Store") {
        return;
      }

      logger.debug(`File changed: ${filename}`);

      if (websocket) {
        websocket.send("zzap:reload");
      }

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
      debug: props.debug,
      onWebSocketOpen(ws) {
        websocket = ws;
      },
    });
  },
  async clean(props: { config: ZzapConfigType; debug: boolean | undefined }) {
    await fs.rm(props.config.outputDir, { recursive: true, force: true });
  },
  async rebuild(props: {
    config: ZzapConfigType;
    paths: string | undefined;
    debug: boolean | undefined;
  }) {
    await ZzapBundler.prepareBuild({ config: props.config });
    await ZzapBundler.build({ config: props.config, paths: props.paths });
  },
  async start(props: {
    port: number | undefined;
    config: ZzapConfigType;
    debug: boolean | undefined;
  }) {
    startDevServer({
      port: props.port,
      config: props.config,
      debug: props.debug,
    });
  },
};

function startDevServer(props: {
  port: number | undefined;
  config: ZzapConfigType;
  debug: boolean | undefined;
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

      const hasFileExtension = pathname.split(".").length === 2;
      const fileName = hasFileExtension ? "" : "/index.html";
      const pathnameWithoutBasepath = pathname.replace(props.config.base, "/");
      const outDirFilePath = `${props.config.outputDir}${pathnameWithoutBasepath}${fileName}`;

      try {
        let file = Bun.file(outDirFilePath);
        let exists = await file.exists();

        if (outDirFilePath.endsWith(".html")) {
          const pathToRebuild = pathnameWithoutBasepath;

          await $`zzap rebuild --paths=${pathToRebuild} --child ${props.debug ? "--debug" : ""}`;

          file = Bun.file(outDirFilePath);
          exists = await file.exists();
        }

        if (outDirFilePath.endsWith("props.json")) {
          const pathToRebuild = pathnameWithoutBasepath
            .replace("/__zzap/data", "")
            .replace("props.json", "");

          await $`zzap rebuild --paths=${pathToRebuild} --child ${props.debug ? "--debug" : ""}`;

          file = Bun.file(outDirFilePath);
          exists = await file.exists();
        }

        if (!exists) {
          return htmlToReponse({
            html: `
                <h1>zzap watch - 404</h1>
                <p>File not found: <code>${pathnameWithoutBasepath}</code></p>
                <p>Looked at: <code>${outDirFilePath}</code></p>
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
              <p>Error loading <code>${pathnameWithoutBasepath}</code></p>
              <p>Looked at: <code>${outDirFilePath}</code></p>
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
