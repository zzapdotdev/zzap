import type { zzapConfigType } from "../../module";

let counterToBustCache = 0;
export const zaapConfig = {
  async get() {
    counterToBustCache++;

    const configFileLocation = `./zzap.config.tsx?counter==${counterToBustCache}`;
    const configModule = require(configFileLocation);
    const config: zzapConfigType = configModule.default;

    return config;
  },
};
