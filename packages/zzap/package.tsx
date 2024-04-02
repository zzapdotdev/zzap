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

if (command === "dev") {
  const ZzapCLITask = $`bun build --compile ./src/cli.tsx --outfile ./dist/zzap --target node --watch`;
  const typeDefinitionTask = $`tsc --watch --outDir ./dist --preserveWatchOutput`;

  await Promise.all([ZzapCLITask, typeDefinitionTask]);
  process.exit(0);
}

if (command === "package") {
  const ZzapCLITask = $`bun build --compile ./src/cli.tsx --outfile ./dist/zzap --target node `;
  const typeDefinitionTask = $`tsc --outDir ./dist `;

  await Promise.all([ZzapCLITask, typeDefinitionTask]);
  process.exit(0);
}

logger.error(`Unknown command "${command}"`);
