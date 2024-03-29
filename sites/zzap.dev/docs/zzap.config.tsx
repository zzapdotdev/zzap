import React from "react";
import Server from "react-dom/server";
import { defineConfig, plugins } from "zzap";

import path from "path";

export default defineConfig({
  title: "zzap.dev",
  plugins: [
    plugins.tailwind(),
    plugins.picoCSS({
      color: "amber",
      conditional: true,
      module: path.join(__dirname, "../../../node_modules/@picocss/pico"),
    }),
    plugins.dynamic({
      name: "README.md",
      async loader(ctx) {
        const res = await fetch(
          "https://raw.githubusercontent.com/zzapdotdev/zzap/main/README.md",
        );
        const text = await res.text();
        const page = ctx.makePage({
          title: "README",
          description: "README",
          path: "/readme",
          template: "default",
          data: {},
          html: text,
        });
        return {
          pages: [page],
        };
      },
    }),
  ],
  publicFiles: [
    {
      path: path.join(
        __dirname,
        "../../../node_modules/@docsearch/css/dist/style.css",
      ),
      name: "styles/docsearch.css",
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
