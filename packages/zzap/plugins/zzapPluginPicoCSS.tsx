import path from "path";
import { definePlugin } from "../src/domains/plugin/definePlugin";

export const zzapPluginPicoCSS = definePlugin({
  plugin(props: {
    color: string;
    modulePath: string;
    conditional?: boolean;
    classless?: boolean;
  }) {
    const conditionalFileName = props.conditional ? ".conditional" : "";
    const classlessFileName = props.classless ? ".classless" : "";
    const colorFileName = props.color ? `.${props.color}` : "";
    const fileName = `pico${conditionalFileName}${classlessFileName}${colorFileName}.css`;
    return {
      name: "pico-css",
      async onBuild(ctx) {
        const modulePath = path.resolve(ctx.config.rootDir, props.modulePath);

        const cssFile = Bun.file(`${modulePath}/css/${fileName}`);
        await Bun.write(ctx.config.outputDir + "/pico.css", cssFile);

        return {
          heads: [
            <link rel="stylesheet" href={`${ctx.config.base}pico.css`} />,
          ],
          scripts: [],
        };
      },
    };
  },
});
