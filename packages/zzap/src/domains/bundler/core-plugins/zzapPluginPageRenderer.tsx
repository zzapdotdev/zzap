import React from "react";
import type { ZzapConfigType } from "../../config/zzapConfigSchema";
import type { getLogger } from "../../logging/getLogger";
import type { ZzapPageProps } from "../../page/ZzapPageBuilder";

import { definePlugin } from "../../plugin/definePlugin";

export const zzapPluginPageRenderer = definePlugin({
  plugin() {
    return {
      name: "core-page",
      async onRender(ctx) {
        const promises = ctx.pages.map(async (props) => {
          // const indexModule = await getModule({
          //   fileName: "index",
          //   config: ctx.config,
          //   logger: ctx.logger,
          // });
          const result = await getModule({
            fileName: props.template,
            config: ctx.config,
            logger: ctx.logger,
          });

          await Bun.build({
            entrypoints: [result?.location!],
            target: "browser",
            format: "esm",
            minify: !ctx.config.isDev,
            outdir: ctx.config.outputDir + "/__zzap/layouts",
          });

          // const AppComponent = indexModule?.default!;
          const TemplateComponent = result?.module?.default!;
          const content = (
            // <AppComponent page={clientPage}>
            <TemplateComponent {...props} />
            // </AppComponent>
          );

          const root = (
            <div
              id="zzap-root"
              data-zzap-shiki="false"
              data-zzap-dev={ctx.config.isDev ? "true" : "false"}
            >
              {content}
            </div>
          );

          const jsx = ctx.config.document({
            head: (
              <>
                {ctx.heads.map((head, i) => {
                  return <React.Fragment key={i}>{head}</React.Fragment>;
                })}
                <title>{props.title}</title>
                <meta name="og:title" content={props.title} />
                <meta name="og:description" content={props.description} />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content={ctx.config.title} />
                {/* <meta name="og:image" content=""></meta> */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="zzap:template" content={props.template} />
                <meta
                  name="zzap:props"
                  content={JSON.stringify(content.props)}
                />

                <meta name="twitter:title" content={props.title} />
                {/* <meta name="twitter:image" content=""></meta> */}
              </>
            ),
            children: root,
            scripts: (
              <>
                <script
                  type="module"
                  src={`${ctx.config.base}__zzap/layouts/${props.template}.js`}
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

type Module = Awaited<ReturnType<typeof getModule>>;
const modules: Record<string, Module> = {};

async function getModule(props: {
  config: ZzapConfigType;
  fileName: string;
  logger: ReturnType<typeof getLogger>;
}): Promise<
  | {
      location: string;
      module: {
        default(props: ZzapPageProps): JSX.Element;
      };
    }
  | undefined
> {
  const module = modules[props.fileName];

  if (module) {
    return module;
  }

  const tsxExists = await Bun.file(
    `${props.config.layoutsDir}/${props.fileName}.tsx`,
  ).exists();
  const jsxexists = await Bun.file(
    `${props.config.layoutsDir}/${props.fileName}.jsx`,
  ).exists();

  if (tsxExists) {
    try {
      const location = `${props.config.layoutsDir}/${props.fileName}.tsx`;
      const module = await import(location);

      if (!module.default) {
        props.logger.terminate(
          `${props.fileName}.tsx does not have a default export.`,
        );
      }
      modules[props.fileName] = module;
      return { module, location };
    } catch (error) {
      props.logger.terminate(`loading ${props.fileName}.tsx`, { error });
    }
  }

  if (jsxexists) {
    try {
      const location = `${props.config.layoutsDir}/${props.fileName}.jsx`;
      const module = await import(location);

      if (!module.default) {
        props.logger.terminate(
          `${props.fileName}.tsx does not have a default export.`,
        );
      }
      modules[props.fileName] = module;
      return { module, location };
    } catch (error) {
      props.logger.terminate(`loading ${props.fileName}.jsx`, { error });
    }
  }

  props.logger.terminate(
    `no ${props.fileName}.tsx or ${props.fileName}.jsx was found in ${props.config.layoutsDir}.`,
  );
}
