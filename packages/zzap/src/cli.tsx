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
    },
    strict: true,
    allowPositionals: true,
  });

  if (values.debug) {
    enableDebug();
  }

  const command = positionals[2];
  const rootDir = positionals[3];

  const config = await ZzapConfig.get({
    rootDir: rootDir,
  });

  logger.log(
    `Running "zzap ${command}" for root directory "${config.rootDir}"`,
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

  if (command === "build") {
    await ZzapCommander.build({
      config,
    });
  }
}
