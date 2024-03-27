import path from "path";
import type { zzapConfigType } from "./zzapConfigSchema";

let _rootDirectory = "./docs";
let _config: zzapConfigType | undefined = undefined;

export const zzapConfig = {
  setRootDirectory(rootDirectory: string) {
    rootDirectory = rootDirectory || "./docs";
  },
  async get() {
    if (_config) {
      return _config;
    }

    const module = await loadConfigModule();

    const config = { ...module.default } as zzapConfigType;
    config.srcDir = "./" + path.join(`${_rootDirectory}/${config.srcDir}`);
    config.outputDir =
      "./" + path.join(`${_rootDirectory}/${config.outputDir}`);
    config.publicDir =
      "./" + path.join(`${_rootDirectory}/${config.publicDir}`);

    config.rootDir = _rootDirectory;
    config.isProduction = process.env.NODE_ENV === "production";

    return (_config = config);

    async function loadConfigModule() {
      try {
        const location = `${_rootDirectory}/zzap.config.tsx`;
        const module = await import(location);
        return module;
      } catch (error) {}
      const location = `${_rootDirectory}/zzap.config.jsx`;
      const module = await import(location);
      return module;
    }
  },
};
