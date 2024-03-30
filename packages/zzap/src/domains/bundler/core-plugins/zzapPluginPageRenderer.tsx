import React from "react";
import type { ZzapConfigType } from "../../config/zzapConfigSchema";
import type { getLogger } from "../../logging/getLogger";
import type { PageType } from "../../page/ZzapPageBuilder";

import { definePlugin } from "../../plugin/definePlugin";

let indexModule: Awaited<ReturnType<typeof getIndexModule>> | undefined =
  undefined;

export const zzapPluginPageRenderer = definePlugin({
  plugin() {
    return {
      name: "core-page",
      async processor(ctx) {
        const promises = ctx.pages.map(async (page) => {
          const clientPage: PageType = {
            ...page,
            template: page.template || "default",
            titleWithSiteTitle: `${page.title} • ${ctx.config.title}`,
            sitemap: ctx.sitemap,
          };

          if (!indexModule) {
            indexModule = await getIndexModule({
              config: ctx.config,
              logger: ctx.logger,
            });
          }

          const AppComponent = indexModule?.default!;

          const content = <AppComponent page={clientPage}></AppComponent>;

          const root = (
            <div id="zzap-root" data-zzap-shiki="false">
              {content}
            </div>
          );

          const jsx = ctx.config.document({
            head: (
              <>
                {ctx.heads.map((head, i) => {
                  return <React.Fragment key={i}>{head}</React.Fragment>;
                })}
                <title>{clientPage.titleWithSiteTitle}</title>
                <meta name="og:title" content={clientPage.titleWithSiteTitle} />
                <meta name="og:description" content={clientPage.description} />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content={ctx.config.title} />
                {/* <meta name="og:image" content=""></meta> */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta
                  name="twitter:title"
                  content={clientPage.titleWithSiteTitle}
                />
                {/* <meta name="twitter:image" content=""></meta> */}
              </>
            ),
            children: root,
            scripts: (
              <>
                <script
                  type="module"
                  dangerouslySetInnerHTML={{
                    __html: `
              window.__zzap = ${JSON.stringify({
                props: content.props,
              })};`,
                  }}
                ></script>
                {ctx.scripts.map((script, i) => {
                  return <React.Fragment key={i}>{script}</React.Fragment>;
                })}
              </>
            ),
          });
          const html = ctx.config.deps["react-dom/server"].renderToString(jsx);

          const is404Page = page.path === "/404";

          if (is404Page) {
            await Bun.write(`${ctx.config.outputDir}/${page.path}.html`, html);
            await Bun.write(
              `${ctx.config.outputDir}/${page.path}/index.html`,
              html,
            );
            if (!ctx.config.isProduction) {
              await Bun.write(
                `${ctx.config.outputDir}/__zzap/data/${page.path}/props.json`,
                JSON.stringify(content.props),
              );
            }
          } else {
            await Bun.write(
              `${ctx.config.outputDir}/${page.path}/index.html`,
              html,
            );
            if (!ctx.config.isProduction) {
              await Bun.write(
                `${ctx.config.outputDir}/__zzap/data/${page.path}/props.json`,
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

async function getIndexModule(props: {
  config: ZzapConfigType;
  logger: ReturnType<typeof getLogger>;
}): Promise<{ default: typeof DefaultAppComponent } | undefined> {
  const indexTsxExists = await Bun.file(
    `${props.config.srcDir}/index.tsx`,
  ).exists();
  const indexJsxExists = await Bun.file(
    `${props.config.srcDir}/index.jsx`,
  ).exists();

  if (indexTsxExists) {
    try {
      const location = `${props.config.srcDir}/index.tsx`;
      const module = await import(location);

      if (!module.default) {
        props.logger.terminate(`index.tsx does not have a default export.`);
      }

      return module;
    } catch (error) {
      props.logger.terminate(`loading index.tsx`, { error });
    }
  }

  if (indexJsxExists) {
    try {
      const location = `${props.config.srcDir}/index.jsx`;
      const module = await import(location);

      if (!module.default) {
        props.logger.terminate(`index.tsx does not have a default export.`);
      }

      return module;
    } catch (error) {
      props.logger.terminate(`loading index.jsx`, { error });
    }
  }

  props.logger.terminate(
    `no index.tsx or index.jsx was found in ${props.config.srcDir}.`,
  );
}

function DefaultAppComponent(_props: { page: PageType }) {
  return <></>;
}
