import { definePlugin } from "../src/domains/plugin/definePlugin";

export const zzapPluginVercelJSON = definePlugin({
  plugin(props: { json: any }) {
    return {
      name: "zzap-plugin-vercel-json",
      async loader(ctx) {
        const json = JSON.stringify(props.json, null, 2);
        await Bun.write(ctx.config.outputDir + "/vercel.json", json);
      },
    };
  },
});
