import path from "path";
import { definePlugin } from "../src/domains/plugin/definePlugin";
export const zzapPluginTailwind = definePlugin({
  plugin(props: { filePath: string }) {
    return {
      name: "tailwind",
      async onBuild(ctx) {
        const filepath = path.join(ctx.config.rootDir, props.filePath);
        await ctx.$`ls && tailwindcss -i ${filepath} -o ./docs/.zzap/dist/styles/zzap-plugin-tailwind.css`;

        return {
          heads: [
            <link
              rel="stylesheet"
              href={`${ctx.config.base}styles/zzap-plugin-tailwind.css`}
            />,
            <script
              type="module"
              dangerouslySetInnerHTML={{
                __html: `
              const zzapTheme = document.documentElement.getAttribute("data-zzap-theme");
              document.documentElement.setAttribute("data-theme", zzapTheme);
              if(zzapTheme === "dark"){
                document.documentElement.classList.add("dark");
                document.documentElement.classList.add("tw-dark");
              } else{
                document.documentElement.classList.remove("dark");
                document.documentElement.classList.remove("tw-dark");
              }
          `,
              }}
            ></script>,
          ],
          scripts: [],
        };
      },
    };
  },
});
