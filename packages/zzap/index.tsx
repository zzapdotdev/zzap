import { $ } from "bun";
import { parseArgs } from "util";
import { getLogger } from "./src/domains/logging/getLogger";

const { values, positionals } = parseArgs({
  args: Bun.argv,
  strict: true,
  allowPositionals: true,
});

const command = positionals[2];
const logger = getLogger("lib");

logger.log(`Running "${command}"`);

if (command === "dev") {
  const zzapCLITask = $`bun build --compile ./src/cli.tsx --outfile ./dist/zzap --target node --watch `;
  const zzapModuleTask = $`bun build ./src/module.tsx --outfile ./dist/index.js --target node --watch `;
  const zzapClientModuleTask = $`bun build ./client.tsx --outfile ./dist/client.js --target browser --watch `;
  const typeDefinitionTask = $`tsc --watch --outDir ./dist/types --preserveWatchOutput`;

  await Promise.all([
    zzapCLITask,
    zzapModuleTask,
    zzapClientModuleTask,
    typeDefinitionTask,
  ]);
  process.exit(0);
}

if (command === "package") {
  const zzapCLITask = $`bun build --compile ./src/cli.tsx --outfile ./dist/zzap --target node`;
  const zzapModuleTask = $`bun build --minify ./src/module.tsx --outfile ./dist/index.js --target node`;
  const zzapClientModuleTask = $`bun build ./client.tsx --outfile ./dist/client.js --target browser`;
  const typeDefinitionTask = $`tsc --outDir ./dist/types `;

  await Promise.all([
    zzapCLITask,
    zzapModuleTask,
    zzapClientModuleTask,
    typeDefinitionTask,
  ]);
  process.exit(0);
}

logger.error(`Unknown command "${command}"`);
