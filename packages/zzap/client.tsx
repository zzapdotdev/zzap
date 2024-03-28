export type { ZzapClientPageType } from "./src/domains/page/PageBuilder";

export const ZzapClient = {
  isBrowser: typeof window !== "undefined",
  async interactive(RootComponent: any) {
    if (!this.isBrowser) return;

    const ReactDOMClient = await import("react-dom/client");
    const hydrateRoot = ReactDOMClient.hydrateRoot;

    const root = document.querySelector("#zzap-root");

    if (root) {
      hydrateRoot(root, <RootComponent {...window.__zzap.props} />);
    }
  },
  getTheme() {
    if (!this.isBrowser) return;
    const currentTheme =
      document.documentElement.getAttribute("data-zzap-theme");
    return currentTheme as "light" | "dark";
  },
  setTheme(theme: "light" | "dark") {
    if (!this.isBrowser) return;
    document.documentElement.setAttribute("data-zzap-theme", theme);
    localStorage.setItem("zzap-theme", theme);
  },
  async shiki(props?: {
    /**
     * Theme id from https://shiki.matsu.io/themes
     */
    theme: string;
  }) {
    if (!this.isBrowser) return;
    const zzapRoot = document.querySelector("#zzap-root");
    zzapRoot?.setAttribute("data-zzap-shiki", "false");

    const shikiCDN = "https://esm.sh/shiki@1.0.0";
    const { codeToHtml } = await import(shikiCDN);
    const nodes = document.querySelectorAll("pre");
    const promises: Promise<void>[] = [];
    nodes.forEach((node) => {
      promises.push(colorize(node));
    });

    Promise.all(promises);
    zzapRoot?.setAttribute("data-zzap-shiki", "true");

    async function colorize(node: HTMLPreElement) {
      const lang = node.querySelector("code")?.className;
      const nodeText = node.textContent;

      node.outerHTML = await codeToHtml(nodeText, {
        lang: lang,
        theme: props?.theme || "github-dark",
      });
    }
  },
};

declare global {
  interface Window {
    __zzap: {
      props: any;
    };
  }
}
