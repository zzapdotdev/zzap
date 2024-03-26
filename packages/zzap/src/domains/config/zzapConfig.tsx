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

    const configFileLocation = `${_rootDirectory}/zzap.config.tsx`;
    const configModule = await import(configFileLocation);

    const config = { ...configModule.default } as zzapConfigType;
    config.srcDir = "./" + path.join(`${_rootDirectory}/${config.srcDir}`);
    config.outputDir =
      "./" + path.join(`${_rootDirectory}/${config.outputDir}`);
    config.publicDir =
      "./" + path.join(`${_rootDirectory}/${config.publicDir}`);

    config.entryPoints = config.entryPoints.map((entry) => {
      return {
        ...entry,
        path: `${_rootDirectory}/${entry.path}`,
      };
    });
    config.rootDir = _rootDirectory;

    return (_config = config);
  },
};
