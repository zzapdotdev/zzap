import { definePlugin } from "../../plugin/definePlugin";

export const zzapPluginPublicFiles = definePlugin({
  plugin() {
    return {
      name: "core-public-files",
      async onPrepare(ctx) {
        const promises = ctx.config.publicFiles.map(async (file) => {
          const bunFile = ctx.Bun.file(file.path);
          ctx.logger.debug(`Writing public file: ${file.name}`);
          await Bun.write(`${ctx.config.outputDir}/${file.name}`, bunFile);
          ctx.logger.debug(`Wrote public file: ${file.name}`);
        });
        await Promise.all(promises);
      },
    };
  },
});
