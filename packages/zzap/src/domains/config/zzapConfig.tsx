import type { zzapConfigType } from "../../module";

export const zaapConfig = {
  async get() {
    const configFileLocation = "./zzap.config.tsx";
    const configModule = await import(configFileLocation);
    const config: zzapConfigType = configModule.default;
    return config;
  },
};
