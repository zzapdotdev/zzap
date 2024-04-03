import React from "react";
import Server from "react-dom/server";
import { defineConfig, plugins } from "zzap";

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
});

type GitHubReleases = {
  url: string;
  assets_url: string;
  upload_url: string;
  html_url: string;
  id: number;
  author: {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
  };
  node_id: string;
  tag_name: string;
  target_commitish: string;
  name: string;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at: string;
  assets: Array<any>;
  tarball_url: string;
  zipball_url: string;
  body: string;
  mentions_count?: number;
};
