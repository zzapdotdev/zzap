import {
  configSchema,
  type zzapConfigInputType,
} from "./src/domains/config/zzapConfigSchema";

export function defineConfig(config: zzapConfigInputType) {
  const parsedConfig = configSchema.parse(config);
  return parsedConfig;
}
