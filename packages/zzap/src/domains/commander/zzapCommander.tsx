import { $ } from "bun";
import { watch } from "fs";
import path from "path";
import { zzapBundler } from "../bundler/zzapBundler";
import { zzapConfig } from "../config/zzapConfig";
import { getLogger } from "../logging/getLogger";
export let generatingPromise: ReturnType<typeof $> | undefined;

const logger = getLogger();

export const zzapCommander = {
  async watch(props: { port: number | undefined }) {
    await zzapBundler.generate();

    const config = await zzapConfig.get();

    const watcher = watch("./", { recursive: true }, (_event, filename) => {
      if (generatingPromise || !filename) {
        return;
      }

      const fileNameAbsolute = path.join(__dirname, filename);
      const publicDirAbsolutePath = path.join(__dirname, config.publicDir);
      const srcDirAbsolutePath = path.join(__dirname, config.srcDir);

      const foldersToWatch = [publicDirAbsolutePath, srcDirAbsolutePath];
      const filesToWatch = [
        "zzap.config.tsx",
        "tailwind.css",
        "tailwind.config.js",
      ];

      const fileToWatchedChanged = filesToWatch.includes(filename);
      const folderToWatchedChanged = foldersToWatch.some((folder) =>
        fileNameAbsolute.startsWith(folder),
      );

      if (fileToWatchedChanged || folderToWatchedChanged) {
        logger.log(`File changed: ${filename}`);
        // logger.log("watching", {
        //   fileNameAbsolute,
        //   publicDirAbsolutePath,
        //   contentDirAbsolutePath,
        //   fileToWatchedChanged,
        //   folderToWatchedChanged,
        // });
        generatingPromise = $`zzap --build`;
        generatingPromise.then(() => {
          generatingPromise = undefined;
        });
      }
    });

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
