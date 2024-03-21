import Bun from "bun";
import { parseArgs } from "util";
import { zzapCommander } from "./domains/commander/Commadner";
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
      port: {
        type: "string",
      },
    },
    strict: true,
    allowPositionals: true,
  });

  logger.info("Verifying zzap.config.tsx");

  if (values.watch) {
    await zzapCommander.watch({
      port: Number(values.port),
    });
  }

  if (values.build) {
    await zzapCommander.build();
  }
}
