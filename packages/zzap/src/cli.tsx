import Bun from "bun";
import { parseArgs } from "util";
import { zzapCommander } from "./domains/commander/zzapCommander";
import { zzapConfig } from "./domains/config/zzapConfig";
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
  const rootDirectory = positionals[3];
  zzapConfig.setRootDirectory(rootDirectory);
  const config = await zzapConfig.get();
  logger.log(
    `Running "zzap ${command}" for root directory "${config.rootDir}"`,
  );

  if (command === "watch") {
    logger.log(`Cleaning ${config.outputDir}`);
    await zzapCommander.clean();
    logger.log(`Watching ${config.srcDir}`);
    await zzapCommander.watch({
      port: Number(values.port),
    });
  }

  if (command === "build") {
    await zzapCommander.build();
    process.exit(0);
  }
}
