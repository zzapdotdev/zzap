import { $ } from "bun";
import { watch } from "fs";
import { zZapBundler } from "../bundler/zZapBundler";

export let generatingPromise:
  | ReturnType<typeof zZapBundler.generate>
  | undefined;

export const zZapCommander = {
  async watch() {
    await zZapBundler.generate();
    const watcher = watch("./", { recursive: true }, (_event, filename) => {
      const filesToWatch = ["zzap.config.tsx"];

      if (!filesToWatch.includes(filename || "")) {
        return;
      }

      if (generatingPromise) {
        return;
      }

      generatingPromise = zZapBundler.generate();
      generatingPromise.then(() => {
        generatingPromise = undefined;
      });
    });

    watchTailwind();

    process.on("SIGINT", function closeWatcherWhenCtrlCIsPressed() {
      // close watcher when Ctrl-C is pressed
      watcher.close();
      process.exit(0);
    });

    Bun.serve({
      port: 3000,
      fetch(request) {
        const url = request.url;
        const pathname = new URL(url).pathname;

        const fileName = pathname.endsWith("/") ? "index.html" : "";
        return new Response(Bun.file(`./dist${pathname}${fileName}`));
      },
    });
  },
  async build() {
    await zZapBundler.generate();
  },
};

async function watchTailwind() {
  await $`tailwindcss -i ./styles.css -o ./dist/styles.css --watch`;
}
