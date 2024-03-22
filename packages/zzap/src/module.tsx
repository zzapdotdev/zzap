import type { default as React } from "react";
import type { default as Server } from "react-dom/server";

export function defineConfig(config: {
  siteTitle: string;
  favicon: {
    path: string;
  };
  contentFolder: string;
  outputFolder: string;
  tailwind?: boolean;
  cssFiles?: Array<{
    path: string;
    fileName?: string;
  }>;
  react: {
    React: typeof React;
    Server: typeof Server;
  };
  globPatterns?: Array<string>;
  document(props: {
    head: JSX.Element;
    children: JSX.Element;
    scripts: JSX.Element;
  }): JSX.Element;
  body(props: { children: JSX.Element }): JSX.Element;
  dynamic?(context: {
    addPage(props: { path: string; children: JSX.Element }): void;
  }): Promise<void>;
}) {
  return config;
}

export type zzapConfigType = ReturnType<typeof defineConfig>;
