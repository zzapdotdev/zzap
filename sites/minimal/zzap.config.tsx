import React from "react";
import Server from "react-dom/server";
import { defineConfig } from "zzap";

export default defineConfig({
  title: "zzap.dev",

  deps: {
    react: React,
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

            <link rel="stylesheet" href="/pico.css" />
            {props.head}
          </head>
          <body>{props.children}</body>
          {props.scripts}
        </html>
      </>
    );
  },
});
