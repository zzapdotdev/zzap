import { $ } from "bun";
import { watch } from "fs";
import { zzapBundler } from "../bundler/zzapBundler";
import { zzapConfig } from "../config/zzapConfig";
import { getLogger } from "../logging/getLogger";
export let generatingPromise: ReturnType<typeof $> | undefined;

const logger = getLogger();

export const zzapCommander = {
  async watch(props: { port: number | undefined }) {
    await zzapBundler.generate();

    const config = await zzapConfig.get();

    const watcher = watch(
      zzapConfig.getRootDirectory(),
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
      fetch(request) {
        const url = request.url;
        const pathname = new URL(url).pathname;

        const fileName = pathname.split(".").length > 1 ? "" : "/index.html";
        const path = `${config.outputDir}${pathname}${fileName}`;
        logger.debug(`Serving: ${path}`);
        return new Response(Bun.file(path));
      },
    });
  },
  async build() {
    await zzapBundler.generate();
  },
};
