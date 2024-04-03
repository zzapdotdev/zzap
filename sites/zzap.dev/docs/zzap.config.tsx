import React from "react";
import Server from "react-dom/server";
import { defineConfig, plugins } from "zzap";
import { GitHubReleases } from "./src/types/Data";

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
    // plugins.dynamic({
    //   name: "releases",
    //   async loader(ctx) {
    //     const pages = new Array(4000).fill(0).map((_, i) => {
    //       return ctx.makePage({
    //         title: `Release ${i}`,
    //         description: `Release ${i}`,
    //         path: `/releases/${i}`,
    //         template: "releases",
    //         data: {
    //           release: i,
    //         },
    //         html: `<h1>Release ${i}</h1>`,
    //       });
    //     });

    //     return {
    //       pages,
    //     };
    //   },
    // }),
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
      async getPage() {
        const releasesResponse = await fetch(
          "https://api.github.com/repos/zzapdotdev/zzap/releases",
        );
        const data: Array<GitHubReleases> = await releasesResponse.json();

        return {
          title: "zzap Releases",
          description: "What's new with zzap",
          template: "releases",
          data: {
            releases: data,
          },
        };
      },
    },
    "/releases/:id": {
      async getPathParams() {
        const releaseResponse = await fetch(
          "https://api.github.com/repos/zzapdotdev/zzap/releases",
        );
        const data: Array<GitHubReleases> = await releaseResponse.json();

        return data.map((release) => {
          return {
            params: {
              id: release.id,
            },
          };
        });
      },
      async getPage(props) {
        const releaseResponse = await fetch(
          `https://api.github.com/repos/zzapdotdev/zzap/releases/${props.params.id}`,
        );
        const data: GitHubReleases = await releaseResponse.json();

        return {
          title: data.name,
          description: data.body,
          template: "release",
          data: {
            release: data,
          },
        };
      },
    },
  },
});
