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

  logger.log(
    `Running "zzap ${command}" for root directory "${zzapConfig.getRootDirectory()}"`,
  );

  if (command === "watch") {
    await zzapCommander.watch({
      port: Number(values.port),
    });
    // process.exit(0);
  }

  if (command === "build") {
    await zzapCommander.build();
    process.exit(0);
  }

  // logger.error(`Unknown command "${command}"`);
}
