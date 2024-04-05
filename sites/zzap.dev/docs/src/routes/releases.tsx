import kebabCase from "lodash/kebabCase";
import path from "path";
import { RouteContext, ZzapProps, defineRoute } from "zzap";

export default defineRoute({
  async getPage(params, ctx) {
    const releases = await getRelease({ ctx, includePage: false });

    return {
      title: "zzap Releases",
      description: "What's new with zzap",
      layout: "releases",
      releases,
    };
  },
});

export async function getRelease(props: {
  ctx: RouteContext;
  includePage: boolean;
}) {
  const glob = new Bun.Glob(`${props.ctx.config.srcDir}/data/releases/*.md`);

  const fileIterator = glob.scan({
    cwd: ".",
    onlyFiles: true,
  });

  const releases: Array<ZzapProps<{ id: string }>> = [];

  for await (const filePath of fileIterator) {
    const markdown = await Bun.file(filePath).text();
    const fileNameWithoutExtension = path.basename(filePath, ".md");

    const [pageProps] = props.ctx.markdownToPage({
      markdown,
    });

    releases.push({
      ...pageProps,
      id: kebabCase(fileNameWithoutExtension),
    });
  }
  return releases;
}
