import { definePlugin } from "../../plugin/definePlugin";

export const zzapPluginScript = definePlugin({
  plugin() {
    return {
      name: "core-script",
      async loader(ctx) {
        await Bun.build({
          entrypoints: [ctx.config.srcDir + "/index.tsx"],
          target: "browser",
          format: "esm",
          outdir: ctx.config.outputDir + "/__zzap-scripts",
        });

        return {
          scripts: [<script type="module" src="/__zzap-scripts/index.js" />],
        };
      },
    };
  },
});
