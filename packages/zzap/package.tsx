import { $ } from "bun";
import { parseArgs } from "util";
import { getLogger } from "./src/domains/logging/getLogger";

const { positionals } = parseArgs({
  args: Bun.argv,
  strict: true,
  allowPositionals: true,
});

const command = positionals[2];
const logger = getLogger("lib");

logger.log(`Running "${command}"`);

if (command === "dev") {
  const NODE_ENV = "development";
  const zzapCLITask = $`NODE_ENV=${NODE_ENV} bun build --compile ./src/cli.tsx --outfile ./dist/zzap --target node --watch `;
  const typeDefinitionTask = $`NODE_ENV=${NODE_ENV} tsc --watch --outDir ./dist --preserveWatchOutput`;

  await Promise.all([
    zzapCLITask,
    typeDefinitionTask,
  ]);
  process.exit(0);
}

if (command === "package") {
  const NODE_ENV = "production";
  const zzapCLITask = $`NODE_ENV=${NODE_ENV} bun build --compile ./src/cli.tsx --outfile ./dist/zzap --target node`;
  const typeDefinitionTask = $`NODE_ENV=${NODE_ENV} tsc --outDir ./dist `;

  await Promise.all([
    zzapCLITask,
    typeDefinitionTask,
  ]);
  process.exit(0);
}

logger.error(`Unknown command "${command}"`);
