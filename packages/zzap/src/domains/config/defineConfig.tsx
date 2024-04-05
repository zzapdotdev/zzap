import { zzapConfigSchema, type zzapConfigInputType } from "./zzapConfigSchema";

export function defineConfig(config: zzapConfigInputType) {
  const parsedConfig = zzapConfigSchema.parse(config);
  return parsedConfig;
}
