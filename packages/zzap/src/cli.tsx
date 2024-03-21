import Bun from "bun";
import { parseArgs } from "util";
import { zZapCommander } from "./domains/commander/zZapCommander";
import { getLogger } from "./domains/logging/getLogger";

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
    },
    strict: true,
    allowPositionals: true,
  });

  logger.info("Verifying zzap.config.tsx");

  if (values.watch) {
    await zZapCommander.watch();
  }

  if (values.build) {
    await zZapCommander.build();
  }
}
