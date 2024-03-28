import { $ } from "bun";
import { getLogger } from "../src/domains/logging/getLogger";

const logger = getLogger("distribute");

const packageJson = await Bun.file("./package.json").json();
const [major, minor, patch] = packageJson.version.split(".");
const newVersion = `${major}.${minor}.${parseInt(patch) + 1}`;

logger.log(`Current version: "${packageJson.version}"`);
logger.log(`Bumping to ${newVersion}`);

logger.log("Updating package.json");
packageJson.version = newVersion;
await Bun.write("./package.json", JSON.stringify(packageJson, null, 2));

logger.log("Configuring Git");
await $`git config user.name github-actions`;
await $`git config user.email`;

logger.log("Tagging");
await $`git tag -a v${newVersion} -m "v${newVersion}"`;

logger.log("Pushing tag");
await $`git push origin v${newVersion}`;

logger.log("Committing");
await $`git add .`;
await $`git commit -m "chore: bump package.json to ${newVersion}"`;
logger.log("Pushing");
await $`git push`;
