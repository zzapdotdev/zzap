import kebabCase from "lodash/kebabCase";
import path from "path";
import React from "react";
import Server from "react-dom/server";
import { RouteHandlerContextType, defineConfig, plugins } from "zzap";

import { ZzapPageProps } from "zzap/src/domains/page/ZzapPageBuilder";

export default defineConfig({
  title: "zzap.dev",
  plugins: [
    plugins.tailwind({
      filePath: "./src/tailwind.css",
    }),
    plugins.picoCSS({
      color: "amber",
      conditional: true,
      modulePath: "../../../node_modules/@picocss/pico",
    }),
  ],
  publicFiles: [
    {
      filePath: "../../../node_modules/@docsearch/css/dist/style.css",
      name: "styles/docsearch.css",
    },
    {
      filePath: "./src/styles/index.css",
      name: "styles/index.css",
    },
  ],
  deps: {
    "react-dom/server": Server,
  },
  document(props) {
    return (
      <>
        <html lang="en">
          <head>
            <meta charSet="UTF-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
            <link rel="icon" href="/favicon.png" />
            <link rel="stylesheet" href="/styles/index.css" />
            <link rel="stylesheet" href="/styles/docsearch.css" />

            {props.head}
          </head>
          <body>{props.children}</body>
          {props.scripts}
        </html>
      </>
    );
  },

  routes: {
    "/releases": {
      async getPage(params, ctx) {
        const releases = await getRelease({ ctx, includePage: false });

        return {
          title: "zzap Releases",
          description: "What's new with zzap",
          template: "releases",
          releases,
        };
      },
    },
    "/releases/:id": {
      async getPathParams(ctx) {
        const releases = await getRelease({
          ctx,
          includePage: true,
        });

        return releases.map((release) => ({
          params: {
            id: release.id,
          },
        }));
      },
      async getPage(props, ctx) {
        const releases = await getRelease({
          ctx: ctx,
          includePage: true,
        });
        const release = releases.find(
          (release) => release.id === props.params.id,
        );

        if (!release) {
          return;
        }

        return {
          ...release,
          template: "release",
        };
      },
    },
  },
});

export async function getRelease(props: {
  ctx: RouteHandlerContextType;
  includePage: boolean;
}) {
  const glob = new Bun.Glob("./src/data/releases/*.md");

  const fileIterator = glob.scan({
    cwd: __dirname,
    onlyFiles: true,
  });

  const releases: Array<ZzapPageProps<{ id: string }>> = [];

  for await (const filePath of fileIterator) {
    const markdown = await Bun.file(path.join(__dirname, filePath)).text();
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
