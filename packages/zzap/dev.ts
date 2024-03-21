import Bun, { $ } from "bun";

const zzapCLITask = $`bun --watch build --compile ./src/cli.tsx --outfile ./dist/zzap --target node`;
const zzapModuleTask = $`bun --watch build ./src/module.tsx --outfile ./dist/index.js --target node`;
const typeDefinitionTask = $`tsc --watch --outDir ./dist/types --preserveWatchOutput`;

await Promise.all([zzapCLITask, zzapModuleTask, typeDefinitionTask]);
