import React from "react";
import { defineConfig } from "zzap";

export default defineConfig({
  siteTitle: "zzap",
  contentFolder: "./content",
  outputFolder: "./dist",
  cssFiles: ["styles.css"],
  layout(props) {
    return (
      <>
        <html lang="en">
          <head>
            <meta charSet="UTF-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
            <link rel="stylesheet" href="/styles.css" />
            {props.head}
          </head>
          <body>{props.children}</body>
        </html>
      </>
    );
  },
});
