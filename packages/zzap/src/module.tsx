export function defineConfig(config: {
  siteTitle: string;
  contentFolder: string;
  outputFolder: string;
  tailwind?: boolean;
  cssFiles?: Array<{
    path: string;
    fileName?: string;
  }>;
  globPatterns?: Array<string>;
  layout(props: {
    head: JSX.Element;
    children: JSX.Element;
    scripts: JSX.Element;
  }): JSX.Element;
  dynamic?(context: {
    addPage(props: { path: string; children: JSX.Element }): void;
  }): Promise<void>;
}) {
  return config;
}

export type zzapConfigType = ReturnType<typeof defineConfig>;
