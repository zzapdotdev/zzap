import React from "react";
import Server from "react-dom/server";
import { defineConfig } from "zzap";
import { Root } from "./src/Root";

export default defineConfig({
  title: "zzap.dev",
  commands: [
    {
      command: `tailwindcss -i ./tailwind.css -o .zzap/dist/tailwind.css`,
    },
  ],
  publicFiles: [
    {
      path: "../../node_modules/@picocss/pico/css/pico.css",
      name: "pico.css",
    },
  ],
  entryPoints: [{ path: "./src/index.tsx" }],
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
            <link rel="stylesheet" href="/tailwind.css" />
            <link rel="stylesheet" href="/pico.css" />
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
