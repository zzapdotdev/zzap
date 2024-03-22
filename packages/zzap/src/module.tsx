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
  layout(props: { head: JSX.Element; children: JSX.Element }): JSX.Element;
  dynamic?(): Promise<
    Array<{
      path: string;
      children: JSX.Element;
    }>
  >;
}) {
  return config;
}

export type zzapConfigType = ReturnType<typeof defineConfig>;
