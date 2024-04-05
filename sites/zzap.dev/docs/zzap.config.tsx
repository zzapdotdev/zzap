import React from "react";
import Server from "react-dom/server";
import { defineConfig, plugins } from "zzap";

export default defineConfig({
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
  document(props, slots) {
    const title = props.title
      ? props.title + " • zzap"
      : "zzap • The content site generator for React that's just really fast";
    const description = props.description;

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
            <title>{title}</title>

            <meta name="og:title" content={title} />
            <meta name="og:description" content={description} />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={title} />
            {/* <meta name="og:image" content=""></meta> */}
            <meta name="twitter:card" content="summary_large_image" />

            <meta name="twitter:title" content={title} />
            {/* <meta name="twitter:image" content=""></meta> */}
            <meta name="description" content={description} />
            {slots.head}
          </head>
          <body>{slots.children}</body>
          {slots.scripts}
        </html>
      </>
    );
  },
});
