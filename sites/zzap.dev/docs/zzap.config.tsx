import React from "react";
import Server from "react-dom/server";
import { defineConfig } from "zzap";
import { Root } from "./src/Root";

export default defineConfig({
  title: "zzap.dev",
  commands: [
    {
      command: `tailwindcss -i ./tailwind.css -o ./docs/.zzap/dist/tailwind.css`,
    },
  ],

  publicFiles: [
    {
      path: "../../node_modules/@picocss/pico/css/pico.amber.css",
      name: "pico.css",
    },
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
            <link rel="stylesheet" href="/tailwind.css" />
            <link rel="stylesheet" href="/pico.css" />
            <link rel="stylesheet" href="/styles.css" />
            {props.head}
            <script
              type="module"
              dangerouslySetInnerHTML={{
                __html: `
            const themeModePreferences = window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light";
            const themeMode = localStorage.getItem("zzap-theme") || themeModePreferences
            if (themeMode) {

              document.documentElement.setAttribute("zzap-theme", themeMode);
              document.documentElement.setAttribute("data-theme", themeMode);
              if(themeMode === "dark"){
                document.documentElement.classList.add("tw-dark");
              } else{
                document.documentElement.classList.remove("tw-dark");
              }
            }
            `,
              }}
            ></script>
          </head>
          <body>{props.children}</body>
          {props.scripts}
        </html>
      </>
    );
  },
  RootComponent: Root,
});
