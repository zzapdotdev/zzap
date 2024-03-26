import { definePlugin } from "../src/domains/plugin/definePlugin";

export const zzapPluginTailwind = definePlugin({
  plugin() {
    return {
      name: "zzap-plugin-tailwind",
      async loader(ctx) {
        await ctx.$`tailwindcss -i ./tailwind.css -o ./docs/.zzap/dist/zzap-plugin-tailwind.css`;

        return {
          heads: [
            <link rel="stylesheet" href="/zzap-plugin-tailwind.css" />,
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
