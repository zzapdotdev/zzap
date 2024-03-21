import { $ } from "bun";
import { watch } from "fs";
import { zzapBundler } from "../bundler/zzapBundler";

export let generatingPromise:
  | ReturnType<typeof zzapBundler.generate>
  | undefined;

export const zzapCommander = {
  async watch(props: { port: number | undefined }) {
    await zzapBundler.generate();

    const watcher = watch("./", { recursive: true }, (_event, filename) => {
      const filesToWatch = ["zzap.config.tsx"];

      if (!filesToWatch.includes(filename || "")) {
        return;
      }

      if (generatingPromise) {
        return;
      }

      generatingPromise = zzapBundler.generate();
      generatingPromise.then(() => {
        generatingPromise = undefined;
      });
    });

    tailwind({
      watch: true,
    });

    process.on("SIGINT", function closeWatcherWhenCtrlCIsPressed() {
      // close watcher when Ctrl-C is pressed
      watcher.close();
      process.exit(0);
    });

    Bun.serve({
      port: props.port || 3000,
      fetch(request) {
        const url = request.url;
        const pathname = new URL(url).pathname;

        const fileName = pathname.split(".").length > 1 ? "" : "/index.html";
        return new Response(Bun.file(`./dist${pathname}${fileName}`));
      },
    });
  },
  async build() {
    await tailwind();
    await zzapBundler.generate();
  },
};

async function tailwind(props: { watch?: boolean } = {}) {
  await $`tailwindcss -i ./styles.css -o ./dist/styles.css ${props.watch ? "--watch" : ""}`;
}
