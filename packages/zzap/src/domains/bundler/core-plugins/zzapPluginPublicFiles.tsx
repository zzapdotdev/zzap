import { definePlugin } from "../../plugin/definePlugin";

export const zzapPluginPublicFiles = definePlugin({
  plugin() {
    return {
      name: "core-public-files",
      async onPrepare(ctx) {
        const promises = ctx.config.publicFiles.map(async (file) => {
          const bunFile = ctx.Bun.file(file.path);
          await Bun.write(`${ctx.config.outputDir}/${file.name}`, bunFile);
        });
        await Promise.all(promises);
      },
    };
  },
});
