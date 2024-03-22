import React from "react";
import Server from "react-dom/server";
import { defineConfig } from "zzap";
import { Content } from "./src/Content";

export default defineConfig({
  siteTitle: "zzap.dev",
  contentFolder: "./content",
  outputFolder: "./dist",
  tailwind: true,
  favicon: {
    path: "./favicon.png",
  },
  react: {
    React: React,
    Server: Server,
  },
  cssFiles: [
    {
      path: "../../node_modules/@picocss/pico/css/pico.css",
    },
  ],
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

            <link rel="stylesheet" href="/zzap-styles/pico.css" />
            {props.head}
          </head>
          <body>{props.children}</body>
          {props.scripts}
        </html>
      </>
    );
  },
  body(props) {
    return <Content>{props.children}</Content>;
  },
});
