import { defineConfig } from "@zzapdotdev/zzap";
import React from "react";
import Server from "react-dom/server";
export default defineConfig({
  title: "zzap.dev",
  plugins: [],
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
