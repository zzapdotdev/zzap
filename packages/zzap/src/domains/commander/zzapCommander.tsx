import { $ } from "bun";
import { watch } from "fs";
import { zzapBundler } from "../bundler/zzapBundler";
import { zaapConfig } from "../config/zzapConfig";
import { getLogger } from "../logging/getLogger";

export let generatingPromise:
  | ReturnType<typeof zzapBundler.generate>
  | undefined;

const logger = getLogger();

export const zzapCommander = {
  async watch(props: { port: number | undefined; open?: boolean }) {
    await zzapBundler.generate();

    const config = await zaapConfig.get();

    const watcher = watch("./", { recursive: true }, (_event, filename) => {
      if (generatingPromise || !filename) {
        return;
      }
      const isInsideDistFolder = filename.includes("dist/");
      if (isInsideDistFolder) {
        return;
      }

      const contentFolderPath = config.contentFolder.replace("./", "");
      const foldersToWatch = [contentFolderPath, "src"];
      const filesToWatch = ["zzap.config.tsx"];

      if (
        filesToWatch.includes(filename) ||
        foldersToWatch.some((folder) => filename.startsWith(folder))
      ) {
        logger.info(`File changed: ${filename}`);
        generatingPromise = zzapBundler.generate();
        generatingPromise.then(() => {
          generatingPromise = undefined;
        });
      }
    });

    if (config.tailwind) {
      runTailwind({
        watch: true,
      });
    }

    process.on("SIGINT", function closeWatcherWhenCtrlCIsPressed() {
      // close watcher when Ctrl-C is pressed
      watcher.close();
      process.exit(0);
    });

    const port = props.port || 3000;
    logger.info(`zzap server running on http://localhost:${port}`);

    Bun.serve({
      port: port,
      fetch(request) {
        const url = request.url;
        const pathname = new URL(url).pathname;

        const fileName = pathname.split(".").length > 1 ? "" : "/index.html";
        return new Response(Bun.file(`./dist${pathname}${fileName}`));
      },
    });
  },
  async build() {
    const config = await zaapConfig.get();
    if (config.tailwind) {
      await runTailwind({
        watch: false,
      });
    }
    await zzapBundler.generate();
  },
};

async function runTailwind(props: { watch: boolean }) {
  await $`tailwindcss -i ./tailwind.css -o ./dist/zzap-styles/tailwind.css ${props.watch ? "--watch" : ""}`;
}
