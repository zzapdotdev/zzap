import { definePlugin } from "../../plugin/definePlugin";

export const zzapPluginPublicDir = definePlugin({
  plugin() {
    return {
      name: "core-public-dir",
      async loader(ctx) {
        const publicGlob = new ctx.Bun.Glob(ctx.config.publicDir + "/**/*");

        const publicFiles = publicGlob.scan({
          cwd: ".",
          onlyFiles: true,
        });

        for await (const file of publicFiles) {
          const path = file.replace(ctx.config.publicDir, "");
          const bunFile = Bun.file(file);
          await Bun.write(`${ctx.config.outputDir}/${path}`, bunFile);
        }
      },
    };
  },
});
