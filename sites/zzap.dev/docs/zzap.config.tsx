import kebabCase from "lodash/kebabCase";
import path from "path";
import React from "react";
import Server from "react-dom/server";
import { RouteHandlerContextType, defineConfig, plugins } from "zzap";

import markdownit from "markdown-it";
import { PageType } from "zzap/client";

const md = markdownit({
  html: true,
  linkify: true,
  langPrefix: "",
});

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
        console.log(
          "IDS",
          releases.map((release) => release.id),
        );
        return {
          title: "zzap Releases",
          description: "What's new with zzap",
          template: "releases",
          data: {
            releases,
          },
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

        if (!release?.page) {
          return;
        }

        return {
          ...release.page,
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
  const glob = new Bun.Glob("./src/releases/*.md");

  const fileIterator = glob.scan({
    cwd: __dirname,
    onlyFiles: true,
  });

  const releases: Array<{
    title: string;
    description: string;
    id: string;
    page: PageType | undefined;
  }> = [];

  for await (const filePath of fileIterator) {
    const markdown = await Bun.file(path.join(__dirname, filePath)).text();
    const fileNameWithoutExtension = path.basename(filePath, ".md");

    const [page] = props.ctx.markdownToPage({
      markdown,
    });

    releases.push({
      title: page.title,
      description: page.description,
      id: kebabCase(fileNameWithoutExtension),
      page: props.includePage ? page : undefined,
    });
  }
  return releases;
}
