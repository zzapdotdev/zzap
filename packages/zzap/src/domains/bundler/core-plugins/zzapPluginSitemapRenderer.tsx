import { definePlugin } from "../../plugin/definePlugin";

export const zzapPluginSitemapRenderer = definePlugin({
  plugin() {
    return {
      name: "core-sitemap",
      async processor(ctx) {
        const siteMap = `
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${ctx.sitemap
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
        Bun.write(`${ctx.config.outputDir}/sitemap.xml`, siteMap);
      },
    };
  },
});
