export function defineConfig(config: {
  siteTitle: string;
  cssFiles?: Array<string>;
  layout: (props: { head: JSX.Element; children: JSX.Element }) => JSX.Element;
}) {
  return config;
}

export type zZapConfig = ReturnType<typeof defineConfig>;
