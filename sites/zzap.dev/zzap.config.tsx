import React from "react";
import { defineConfig } from "zzap";
import { Content } from "./src/Content";

export default defineConfig({
  siteTitle: "zzap.dev",
  contentFolder: "./content",
  outputFolder: "./dist",
  tailwind: true,
  cssFiles: [
    {
      path: "../../node_modules/@picocss/pico/css/pico.css",
    },
  ],
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

            {props.head}
          </head>
          <body>
            <div id="root">
              <React.StrictMode>
                <Content>{props.children}</Content>
              </React.StrictMode>
            </div>
          </body>
          {props.scripts}
        </html>
      </>
    );
  },
});
