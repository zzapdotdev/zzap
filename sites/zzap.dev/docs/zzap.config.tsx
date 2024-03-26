import React from "react";
import Server from "react-dom/server";
import { defineConfig } from "zzap";
import { zzapPluginPicoCSS } from "zzap/plugins/zzapPluginPicoCSS";
import { zzapPluginTailwind } from "zzap/plugins/zzapPluginTailwind";
import { zzapPluginVercelJSON } from "zzap/plugins/zzapPluginVercelJSON";

import { Root } from "./src/Root";

import path from "path";

export default defineConfig({
  title: "zzap.dev",
  plugins: [
    zzapPluginTailwind(),
    zzapPluginPicoCSS({
      color: "amber",
      module: path.join(__dirname, "../../../node_modules/@picocss/pico"),
    }),
    zzapPluginVercelJSON({
      json: {
        redirects: [
          {
            source: "/discord",
            destination: "https://discord.gg/3FxnevyEth",
            permanent: true,
          },
        ],
      },
    }),
  ],
  entryPoints: [{ path: "./src/index.tsx" }],
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
            <link rel="stylesheet" href="/styles.css" />
            {props.head}
          </head>
          <body>{props.children}</body>
          {props.scripts}
        </html>
      </>
    );
  },
  RootComponent: Root,
});
