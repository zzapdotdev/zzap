import Bun from "bun";
import { parseArgs } from "util";
import { ZzapCommander } from "./domains/commander/ZzapCommander";
import { ZzapConfig } from "./domains/config/ZzapConfig";
import type { ZzapConfigType } from "./domains/config/zzapConfigSchema";
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
    },
    strict: true,
    allowPositionals: true,
  });

  if (values.debug) {
    enableDebug();
  }

  const command = positionals[2] as ZzapConfigType["command"];
  const rootDir = positionals[3];

  const config = await ZzapConfig.get({
    rootDir: rootDir,
    command,
  });

  logger.log(
    `Running "zzap ${command}" for root directory "${config.rootDir}" (${process.env.NODE_ENV})`,
  );

  if (command === "watch") {
    logger.log(`Cleaning ${config.outputDir}`);
    await ZzapCommander.clean({
      config,
    });

    logger.log(`Watching ${config.srcDir}`);
    await ZzapCommander.watch({
      config,
      port: Number(values.port),
    });
  }

  if (command === "start") {
    logger.log(`Cleaning ${config.outputDir}`);
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
    logger.log(`Cleaning ${config.outputDir}`);
    await ZzapCommander.clean({
      config,
    });
    await ZzapCommander.build({
      config,
    });
  }
}
