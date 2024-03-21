import type { zZapConfig as zZapConfigType } from "../../module";

export const zaapConfig = {
  async get() {
    const configFileLocation = "./zzap.config.tsx";
    const configModule = await import(configFileLocation);
    const config: zZapConfigType = configModule.default;
    return config;
  },
};
