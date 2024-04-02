import { definePlugin } from "../../plugin/definePlugin";

export const zzapPluginHeads = definePlugin({
  plugin() {
    return {
      name: "core-heads",
      async onBuild() {
        return {
          heads: [
            <style
              dangerouslySetInnerHTML={{
                __html: zzapStyles,
              }}
            />,
            <script
              type="module"
              dangerouslySetInnerHTML={{
                __html: zzapThemeManager,
              }}
            ></script>,
          ],
        };
      },
    };
  },
});

const zzapStyles = `
#zzap-root[data-zzap-shiki="false"] pre {
  opacity: 0;
}

#zzap-root[data-zzap-shiki="true"] pre {
  opacity: 1;
  animation: fadein 0.3s ease-in-out;
}

@keyframes fadein {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

  `;

const zzapThemeManager = `
const themeModePreferences = window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light";
const themeMode = localStorage.getItem("zzap-theme") || themeModePreferences
  document.documentElement.setAttribute("data-zzap-theme", themeMode);
  `;
