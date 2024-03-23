import { $ } from "bun";

const zzapCLITask = $`bun build --compile ./src/cli.tsx --outfile ./dist/zzap --target node`;
const zzapModuleTask = $`bun build --minify ./src/module.tsx --outfile ./dist/index.js --target node`;
const typeDefinitionTask = $`tsc --outDir ./dist/types `;

await Promise.all([zzapCLITask, zzapModuleTask, typeDefinitionTask]);
