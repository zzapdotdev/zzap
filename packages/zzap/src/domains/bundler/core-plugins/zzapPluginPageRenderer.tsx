import React from "react";

import { definePlugin } from "../../plugin/definePlugin";

export const zzapPluginPageRenderer = definePlugin({
  plugin() {
    return {
      name: "core-page",
      async onRender(ctx) {
        const promises = ctx.pages.map(async (props) => {
          const layout = ctx.config.layouts[props.layout];

          if (!layout) {
            ctx.logger.terminate(
              `Could not find layout ${props.layout}.(tsx/jsx) inside ${ctx.config.layoutsDir}`,
            );
          }

          await Bun.build({
            entrypoints: [layout?.location!],
            target: "browser",
            format: "esm",
            minify: !ctx.config.isDev,
            outdir: ctx.config.outputDir + "/__zzap/layouts",
          });

          const TemplateComponent = layout.module.default!;
          const content = <TemplateComponent {...props} />;

          const root = (
            <div
              id="zzap-root"
              data-zzap-shiki="false"
              data-zzap-dev={ctx.config.isDev ? "true" : "false"}
            >
              {content}
            </div>
          );

          const jsx = ctx.config.document(props, {
            head: (
              <>
                {ctx.heads.map((head, i) => {
                  return <React.Fragment key={i}>{head}</React.Fragment>;
                })}

                <meta name="zzap:template" content={props.layout} />
                <meta
                  name="zzap:props"
                  content={JSON.stringify(content.props)}
                />
              </>
            ),
            children: root,
            scripts: (
              <>
                <script
                  type="module"
                  src={`${ctx.config.base}__zzap/layouts/${props.layout}.js`}
                ></script>
                {ctx.scripts.map((script, i) => {
                  return <React.Fragment key={i}>{script}</React.Fragment>;
                })}
              </>
            ),
          });
          const html = ctx.config.deps["react-dom/server"].renderToString(jsx);

          const is404Page = props.path === "/404";

          if (is404Page) {
            await Bun.write(`${ctx.config.outputDir}/${props.path}.html`, html);
            await Bun.write(
              `${ctx.config.outputDir}/${props.path}/index.html`,
              html,
            );
            if (ctx.config.isDev) {
              await Bun.write(
                `${ctx.config.outputDir}/__zzap/data/${props.path}/props.json`,
                JSON.stringify(content.props),
              );
            }
          } else {
            await Bun.write(
              `${ctx.config.outputDir}/${props.path}/index.html`,
              html,
            );

            if (ctx.config.isDev) {
              await Bun.write(
                `${ctx.config.outputDir}/__zzap/data/${props.path}/props.json`,
                JSON.stringify(content.props),
              );
            }
          }
        });

        await Promise.all(promises);
      },
    };
  },
});
