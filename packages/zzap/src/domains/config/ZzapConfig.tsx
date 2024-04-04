import path from "path";
import { getLogger } from "../logging/getLogger";
import type { ZzapConfigType } from "./zzapConfigSchema";

const logger = getLogger();

export const ZzapConfig = {
  async get(props: { rootDir: string; isDev: boolean }) {
    const rootDir = props.rootDir || "./docs";

    const module = await loadConfigModule({
      rootDir: rootDir,
    });

    const config = { ...module.default } as ZzapConfigType;
    config.rootDir = rootDir;
    config.isDev = props.isDev;

    config.srcDir = "./" + path.join(rootDir, config.srcDir);
    config.outputDir = "./" + path.join(rootDir, config.outputDir);
    config.publicDir = "./" + path.join(rootDir, config.publicDir);
    config.routesDir = "./" + path.join(config.srcDir, "routes");
    config.layoutsDir = "./" + path.join(config.srcDir, "layouts");

    return config;
  },
};

async function loadConfigModule(props: { rootDir: string }) {
  try {
    const location = `${props.rootDir}/zzap.config.tsx`;
    const module = await import(location);
    return module;
  } catch (error) {}
  try {
    const location = `${props.rootDir}/zzap.config.jsx`;
    const module = await import(location);
    return module;
  } catch (error) {}

  logger.terminate(
    `Could not find zzap.config.tsx or zzap.config.jsx in root directory (${props.rootDir}).`,
  );
}
