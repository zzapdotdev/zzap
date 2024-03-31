import Bun from "bun";
import { parseArgs } from "util";
import { ZzapCommander } from "./domains/commander/ZzapCommander";
import { ZzapConfig } from "./domains/config/ZzapConfig";
import { enableDebug, getLogger } from "./domains/logging/getLogger";

export const logger = getLogger();

await main();

async function main() {
  const { values, positionals } = parseArgs({
    args: Bun.argv,
    options: {
      port: {
        type: "string",
      },
      debug: {
        type: "boolean",
      },
      paths: {
        type: "string",
      },
      child: {
        type: "boolean",
      },
    },
    strict: true,
    allowPositionals: true,
  });

  if (values.debug) {
    enableDebug();
  }

  const command = positionals[2] as "watch" | "start" | "build";
  const rootDir = positionals[3];

  const config = await ZzapConfig.get({
    rootDir: rootDir,
    isDev: command === "watch" || !!values.child,
  });

  logger.debug(
    `Running "zzap ${command}" for root directory "${config.rootDir}" (${process.env.NODE_ENV})`,
  );

  if (command === "watch") {
    logger.debug(`Cleaning ${config.outputDir}`);
    await ZzapCommander.clean({
      config,
    });

    logger.debug(`Watching ${config.srcDir}`);
    await ZzapCommander.watch({
      config,
      port: Number(values.port),
    });
  }

  if (command === "start") {
    await ZzapCommander.clean({
      config,
    });

    logger.log(`Starting ${config.srcDir}`);
    await ZzapCommander.start({
      config,
      port: Number(values.port),
    });
  }

  if (command === "build") {
    logger.debug(`Cleaning ${config.outputDir}`);
    await ZzapCommander.clean({
      config,
    });

    await ZzapCommander.build({
      config,
      paths: values.paths,
    });
  }
}
