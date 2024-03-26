import { defineConfig } from "@zzapdotdev/zzap";
import { zzapPluginPicoCSS } from "@zzapdotdev/zzap/plugins/zzapPluginPicoCSS";
import { zzapPluginTailwind } from "@zzapdotdev/zzap/plugins/zzapPluginTailwind";
import React from "react";
import Server from "react-dom/server";

import path from "path";

export default defineConfig({
  title: "zzap.dev",
  plugins: [
    zzapPluginTailwind(),
    zzapPluginPicoCSS({
      color: "amber",
      module: path.join(__dirname, "../../../node_modules/@picocss/pico"),
    }),
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
            <link rel="stylesheet" href="/styles.css" />
            {props.head}
          </head>
          <body>{props.children}</body>
          {props.scripts}
        </html>
      </>
    );
  },
});
