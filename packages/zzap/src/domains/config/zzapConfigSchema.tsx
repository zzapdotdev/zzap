import z from "zod";

import type { default as Server } from "react-dom/server";
import type { RoutePageType } from "../page/ZzapPageBuilder";
import type { ZzapPluginType } from "../plugin/definePlugin";

export const zzapConfigSchema = z.object({
  /**
   * The title of the site.
   */
  title: z.string().default(""),
  /**
   * The description of the site.
   */
  description: z.string().default(""),
  /**
   * The base URL of the site.
   */
  base: z.string().startsWith("/").endsWith("/").default("/"),
  /**
   * The directory where the markdown files to be rendered are located.
   * @default "./"
   */
  srcDir: z.string().default("./src"),
  /**
   * The directory where the output files should be placed.
   * @default "./.zzap/dist"
   */
  outputDir: z.string().default("./.zzap/dist"),
  /**
   * The directory where the public assets are located.
   * @default "./public"
   */
  publicDir: z.string().default("./public"),
  /**
   * The files to be copied to the output directory.
   */
  publicFiles: z
    .array(
      z.object({
        filePath: z.string(),
        name: z.string(),
      }),
    )
    .default([]),
  /**
   * An array of custom shell commands to run during the build process.
   */
  commands: z
    .array(
      z.object({
        command: z.string(),
        quiet: z.boolean().default(false),
      }),
    )
    .default([]),
  plugins: z.array(z.any()).default([]) as z.ZodType<
    Array<ZzapPluginType>,
    z.ZodDefaultDef,
    undefined | Array<ZzapPluginType>
  >,
  deps: z.object({
    /**
     * The default ReactDOMServer import.
     * e.g. `import ReactDOMServer from "react-dom/server";`
     */
    "react-dom/server": z.any() as z.ZodType<typeof Server>,
  }),
  document: z
    .function()
    .args(
      z.object({
        head: z.any() as z.ZodType<JSX.Element>,
        children: z.any() as z.ZodType<JSX.Element>,
        scripts: z.any() as z.ZodType<JSX.Element>,
      }),
    )
    .returns(z.any() as z.ZodType<JSX.Element>),
  routes: z
    .record(
      z.string(),
      z.object({
        getPathParams: z
          .function()
          .returns(
            z.promise(
              z.array(z.object({ params: z.record(z.string(), z.any()) })),
            ),
          )
          .optional(),
        getPage: z
          .function()
          .args(z.object({ params: z.record(z.string(), z.any()) }))
          .returns(z.promise(z.any() as z.ZodType<RoutePageType>)),
      }),
    )
    .default({}),
});

export type ZzapConfigType = z.infer<typeof zzapConfigSchema> & {
  rootDir: string;
  isDev: boolean;
};
export type zzapConfigInputType = z.input<typeof zzapConfigSchema>;

export function defineConfig(config: zzapConfigInputType) {
  const parsedConfig = zzapConfigSchema.parse(config);
  return parsedConfig;
}
