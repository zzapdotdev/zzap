import { defineConfig, plugins } from "@zzapdotdev/zzap";
import path from "path";
import React from "react";
import Server from "react-dom/server";

export default defineConfig({
  title: "zzap.dev",
  base: "/base/",
  plugins: [
    plugins.tailwind(),
    plugins.picoCSS({
      color: "amber",
      conditional: true,
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
            {props.head}
          </head>
          <body>{props.children}</body>
          {props.scripts}
        </html>
      </>
    );
  },
});
