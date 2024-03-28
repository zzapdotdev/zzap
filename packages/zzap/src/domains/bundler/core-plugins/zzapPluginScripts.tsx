import { definePlugin } from "../../plugin/definePlugin";

export const zzapPluginScripts = definePlugin({
  plugin() {
    return {
      name: "core-script",
      async loader(ctx) {
        const extension = await getExtension();

        if (!extension) {
          return;
        }

        await Bun.build({
          entrypoints: [ctx.config.srcDir + `/index.${extension}`],
          target: "browser",
          format: "esm",
          minify: ctx.config.isProduction,
          outdir: ctx.config.outputDir + "/__zzap-scripts",
        });

        return {
          scripts: [
            <script
              type="module"
              src={`${ctx.config.base}__zzap-scripts/index.js`}
            />,
          ],
        };

        async function getExtension() {
          try {
            const location = `${ctx.config.rootDir}/zzap.config.tsx`;
            await import(location);
            return "tsx";
          } catch (error) {}
          try {
            const location = `${ctx.config.rootDir}/zzap.config.jsx`;
            await import(location);
            return "jsx";
          } catch (error) {}
          return undefined;
        }
      },
    };
  },
});
