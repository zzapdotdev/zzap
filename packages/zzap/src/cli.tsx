import Bun from "bun";
import { parseArgs } from "util";
import { zzapCommander } from "./domains/commander/zzapCommander";
import { enableDebug, getLogger } from "./domains/logging/getLogger";

export const logger = getLogger();

await main();

async function main() {
  const { values } = parseArgs({
    args: Bun.argv,
    options: {
      watch: {
        type: "boolean",
      },
      build: {
        type: "boolean",
      },
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

  logger.log("Verifying zzap.config.tsx");
  if (values.debug) {
    enableDebug();
  }
  if (values.watch) {
    await zzapCommander.watch({
      port: Number(values.port),
    });
  }

  if (values.build) {
    await zzapCommander.build();
  }
}
