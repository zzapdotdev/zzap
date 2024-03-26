import path from "path";
import { definePlugin } from "../src/domains/plugin/definePlugin";

export const zzapPluginVercelJSON = definePlugin({
  plugin(props: { json: any; dir?: string }) {
    return {
      name: "zzap-plugin-vercel-json",
      async loader(ctx) {
        const json = JSON.stringify(props.json, null, 2);
        const dir = props.dir || ctx.config.rootDir;

        const vercelJSONPath = path.join(dir, "vercel.json");
        ctx.logger.log(`Writing vercel.json to ${vercelJSONPath}`);

        await Bun.write(vercelJSONPath, json);
      },
    };
  },
});
