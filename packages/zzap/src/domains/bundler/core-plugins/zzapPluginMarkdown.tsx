import {
  PageBuilder,
  type ZzapPluginPageType,
} from "../../page/ZzapPageBuilder";
import { definePlugin } from "../../plugin/definePlugin";

export const zzapPluginMarkdown = definePlugin({
  plugin() {
    return {
      name: "core-markdown",
      async loader(ctx) {
        const pages: Array<ZzapPluginPageType<any>> = [];

        const globPatterns = ["**/*.md", "**/*.mdx"];

        for (const pattern of globPatterns) {
          const glob = new Bun.Glob(ctx.config.srcDir + "/" + pattern);

          const filesIterator = glob.scan({
            cwd: ".",
            onlyFiles: true,
          });

          for await (const filePath of filesIterator) {
            const pageMarkdown = await Bun.file(filePath).text();

            const path = filePath
              .replace(ctx.config.srcDir, "")
              .replace(/\.mdx?$/, "")
              .replace(/\.md?$/, "")
              .replace(/\/index$/, "");

            const markdownPages = await PageBuilder.fromMarkdown({
              config: ctx.config as any,
              path: path,
              markdown: pageMarkdown,
            });

            pages.push(...markdownPages);
          }
        }
        return {
          pages,
        };
      },
    };
  },
});
