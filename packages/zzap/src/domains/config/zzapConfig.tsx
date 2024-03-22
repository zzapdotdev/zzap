import type { zzapConfigType } from "../../module";

let get = 0;
export const zaapConfig = {
  async get() {
    get++;

    const configFileLocation = `./zzap.config.tsx?get=${get}`;
    const configModule = require(configFileLocation);
    const config: zzapConfigType = configModule.default;

    return config;
  },
};
