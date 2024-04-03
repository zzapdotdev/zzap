import { $, type ServerWebSocket } from "bun";
import { watch } from "fs";
import fs from "fs/promises";
import { ZzapBundler } from "../bundler/ZzapBundler";
import type { ZzapConfigType } from "../config/zzapConfigSchema";
import { ZzapDevServer } from "../dev-server/ZzapDevServer";
import { getLogger } from "../logging/getLogger";
export let generatingPromise: ReturnType<typeof $> | undefined;

const logger = getLogger();
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
    const zzapDevServerHandlers = ZzapDevServer.start({
      port: props.port,
      config: props.config,
      debug: props.debug,
      onWebSocketOpen(ws) {
        websocket = ws;
      },
    });

    const zzapWatcher: Parameters<typeof watch>["1"] = (_event, filename) => {
      if (generatingPromise || !filename) {
        return;
      }

      if (filename === ".DS_Store") {
        return;
      }

      logger.debug(`File changed: ${filename}`);
      zzapDevServerHandlers.revalidate();
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
    ZzapDevServer.start({
      port: props.port,
      config: props.config,
      debug: props.debug,
    });
  },
};
