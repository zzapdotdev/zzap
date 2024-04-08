import { $, type ServerWebSocket } from "bun";
import path from "path";
import { logger } from "../../cli";
import type { ZzapConfigType } from "../config/zzapConfigSchema";
import { WebPath } from "../web-path/WebPath";

export const ZzapDevServer = {
  start(props: {
    port: number | undefined;
    config: ZzapConfigType;
    debug: boolean | undefined;
    mode: "dev" | "start";
    onWebSocketOpen?: (ws: ServerWebSocket<unknown>) => void;
  }) {
    const state = {
      shouldRevalidate: false,
    };

    const port = props.port || 3000;

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
        const pathnameWithoutBasepath = pathname.replace(
          props.config.base,
          "/",
        );
        const outDirFilePath = path.join(
          props.config.outputDir,
          pathnameWithoutBasepath,
          fileName,
        );
        const outDirPageNotFoundFilePath = path.join(
          props.config.outputDir,
          "/404/index.html",
        );

        try {
          let file = Bun.file(outDirFilePath);
          let exists = await file.exists();

          if (outDirFilePath.endsWith(".html")) {
            const shouldRebuild = state.shouldRevalidate || !exists;
            if (shouldRebuild && props.mode === "dev") {
              const pathToRebuild = WebPath.join(pathnameWithoutBasepath);
              await $`zzap rebuild --paths=${pathToRebuild} --child ${props.debug ? "--debug" : ""}`;
              state.shouldRevalidate = false;
            }

            file = Bun.file(outDirFilePath);
            exists = await file.exists();
          }

          if (outDirFilePath.endsWith("props.json")) {
            const shouldRebuild = state.shouldRevalidate || !exists;

            if (shouldRebuild && props.mode === "dev") {
              const pathToRebuild = WebPath.join(
                pathnameWithoutBasepath
                  .replace("/__zzap/data/", "")
                  .replace("props.json", ""),
              );

              await $`zzap rebuild --paths=${pathToRebuild} --child ${props.debug ? "--debug" : ""}`;
              state.shouldRevalidate = false;
            }

            file = Bun.file(outDirFilePath);
            exists = await file.exists();
          }

          if (!exists) {
            const pageNotFoundFile = Bun.file(outDirPageNotFoundFilePath);
            const pageNotFoundExists = await pageNotFoundFile.exists();

            if (pageNotFoundExists) {
              return new Response(pageNotFoundFile, {
                headers: {
                  "Cache-Control": "no-cache, no-store, must-revalidate",
                },
                status: 404,
              });
            } else {
              return devServerResponse({
                html: `
                    <h1>zzap watch - 404</h1>
                    <p>File not found: <code>${pathnameWithoutBasepath}</code></p>
                    <p>Looked at: <code>${outDirFilePath}</code></p>
                `,
                status: 404,
              });
            }
          }
          return new Response(file, {
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
            },
          });
        } catch (error) {
          return devServerResponse({
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

    logger.log(`zzap server running on http://localhost:${port}`);

    return {
      revalidate() {
        state.shouldRevalidate = true;
      },
    };
  },
};

function devServerResponse(props: { html: string; status?: number }) {
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
