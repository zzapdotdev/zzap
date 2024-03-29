import React from "react";
import type { zzapConfigType } from "../config/zzapConfigSchema";
import { getLogger } from "../logging/getLogger";
import { type PageType, type SitemapItemType } from "../page/ZzapPageBuilder";

export const ZzapRenderer = {
  async renderAndWritePages(props: {
    config: zzapConfigType;
    heads: Array<JSX.Element>;
    scripts: Array<JSX.Element>;
    pages: Array<PageType>;
  }) {
    const logger = getLogger();

    const promises = props.pages.map(async (page) => {
      const module = await getIndexModule({
        config: props.config,
      });
      const AppComponent = module?.default;

      if (!AppComponent) {
        logger.error(
          `while loading index.tsx or index.jsx in ${props.config.srcDir}.`,
        );
        process.exit(0);
      }

      const content = <AppComponent page={page}></AppComponent>;

      const root = (
        <div id="zzap-root" data-zzap-shiki="false">
          {content}
        </div>
      );

      const jsx = props.config.document({
        head: (
          <>
            {props.heads.map((head, i) => {
              return <React.Fragment key={i}>{head}</React.Fragment>;
            })}
            <title>{page.titleWithSiteTitle}</title>
            <meta name="og:title" content={page.titleWithSiteTitle} />
            <meta name="og:description" content={page.description} />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={props.config.title} />
            {/* <meta name="og:image" content=""></meta> */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={page.titleWithSiteTitle} />
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
            {props.scripts.map((script, i) => {
              return <React.Fragment key={i}>{script}</React.Fragment>;
            })}
          </>
        ),
      });
      const html = props.config.deps["react-dom/server"].renderToString(jsx);

      const is404Page = page.path === "/404";

      if (is404Page) {
        await Bun.write(`${props.config.outputDir}/${page.path}.html`, html);
        await Bun.write(
          `${props.config.outputDir}/${page.path}/index.html`,
          html,
        );
      } else {
        await Bun.write(
          `${props.config.outputDir}/${page.path}/index.html`,
          html,
        );
      }
    });

    await Promise.all(promises);
  },

  async renderAndWriteSitemap(props: {
    config: zzapConfigType;
    sitemapItems: Array<SitemapItemType>;
  }) {
    const siteMap = `
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${props.sitemapItems
      .map((siteMapItem) => {
        return `  
<url>
  <loc>${siteMapItem.path || "/"}</loc>
  <changefreq>weekly</changefreq>
</url>`;
      })
      .join("")}
</urlset>
`;
    Bun.write(`${props.config.outputDir}/sitemap.xml`, siteMap);
  },
};

async function getIndexModule(props: {
  config: zzapConfigType;
}): Promise<{ default: typeof DefaultAppComponent } | undefined> {
  const logger = getLogger();
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
      return module;
    } catch (error) {
      logger.terminate(`loading index.tsx`, { error });
    }
  }

  if (indexJsxExists) {
    try {
      const location = `${props.config.srcDir}/index.jsx`;
      const module = await import(location);
      return module;
    } catch (error) {
      logger.terminate(`loading index.jsx`, { error });
    }
  }

  logger.terminate(
    `no index.tsx or index.jsx was found in ${props.config.srcDir}.`,
  );
}

function DefaultAppComponent(_props: { page: PageType }) {
  return <></>;
}
