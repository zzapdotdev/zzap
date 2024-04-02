import { definePlugin } from "../src/domains/plugin/definePlugin";

export const zzapPluginPicoCSS = definePlugin({
  plugin(props: {
    color: string;
    module: string;

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
        const cssFile = Bun.file(`${props.module}/css/${fileName}`);
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
