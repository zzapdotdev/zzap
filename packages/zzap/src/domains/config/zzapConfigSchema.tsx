import z from "zod";

import type { default as Server } from "react-dom/server";
import type { zzapPluginType } from "../plugin/definePlugin";

export const configSchema = z.object({
  /**
   * The title of the site.
   */
  title: z.string().default(""),
  /**
   * The description of the site.
   */
  description: z.string().default(""),
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
        path: z.string(),
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
      }),
    )
    .default([]),
  plugins: z.array(z.any()).default([]) as z.ZodType<Array<zzapPluginType>>,
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
});

export type zzapConfigType = z.infer<typeof configSchema> & {
  rootDir: string;
  isProduction: boolean;
};
export type zzapConfigInputType = z.input<typeof configSchema>;
