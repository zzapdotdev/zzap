import { definePlugin } from "../src/domains/plugin/definePlugin";

export const zzapPluginPicoCSS = definePlugin({
  plugin(props: { color: string; module: string }) {
    return {
      name: "zzap-plugin-pico-css",
      async loader(ctx) {
        ctx.logger.log("Copying Pico CSS");
        const cssFile = Bun.file(`${props.module}/css/pico.${props.color}.css`);
        await Bun.write(ctx.config.outputDir + "/pico.css", cssFile);
        ctx.logger.log("Copied Pico CSS");

        return {
          heads: [<link rel="stylesheet" href="/pico.css" />],
          scripts: [],
        };
      },
    };
  },
});
