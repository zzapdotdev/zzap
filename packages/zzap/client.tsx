import type { Root } from "react-dom/client";
import { getLogger } from "./src/domains/logging/getLogger";

const logger = getLogger("client");
let reactRoot: Root;

export const ZzapClient = {
  inBrowser: typeof window !== "undefined",
  async whenInBrowser(callback: () => Promise<void>) {
    if (this.inBrowser) {
      await callback();
    }
  },
  async interactive() {
    if (!this.inBrowser) {
      return;
    }

    const ReactDOMClient = await import("react-dom/client");
    const hydrateRoot = ReactDOMClient.hydrateRoot;

    const zzapRoot = document.querySelector("#zzap-root");
    const props = JSON.parse(
      document
        .querySelector(`meta[name="zzap:props"]`)
        ?.getAttribute("content") || "{}",
    );
    const template = document
      .querySelector(`meta[name="zzap:template"]`)
      ?.getAttribute("content");
    const LayoutModule = await import(`/__zzap/layouts/${template}.js`);
    const LayoutComponent = LayoutModule.default;

    if (zzapRoot) {
      reactRoot = hydrateRoot(zzapRoot, <LayoutComponent {...props} />);
    } else {
      logger.error("No #zzap-root element found");
    }

    const isDev = zzapRoot?.getAttribute("data-zzap-dev");
    if (isDev === "true") {
      var ws = new WebSocket(`ws://${location.host}`);

      ws.onopen = () => {
        logger.log("Connected to dev server");
      };

      ws.onmessage = async (event) => {
        if (event.data === "zzap:reload") {
          logger.log("Change detected");

          const propsJSONPath =
            location.pathname === "/"
              ? `/__zzap/data/props.json`
              : `/__zzap/data${location.pathname}/props.json`;
          const response = await fetch(propsJSONPath);
          const props = await response.json();

          const propsHaveChanged =
            JSON.stringify(props) !== JSON.stringify(props);

          if (propsHaveChanged) {
            logger.log("Props have changed, re-rendering...");
            reactRoot.render(<LayoutComponent {...props} />);
          } else {
            logger.log("Props have not changed, reloading...");
            window.location.reload();
          }
        }
      };

      ws.onclose = () => {
        logger.log("Disconnected from dev server");
      };

      ws.onerror = (error) => {
        logger.error(`WebSocket error: ${error}`);
      };
    }
  },
  getTheme() {
    if (!this.inBrowser) {
      return;
    }
    const currentTheme =
      document.documentElement.getAttribute("data-zzap-theme");
    return currentTheme as "light" | "dark";
  },
  setTheme(theme: "light" | "dark") {
    if (!this.inBrowser) {
      return;
    }
    document.documentElement.setAttribute("data-zzap-theme", theme);
    localStorage.setItem("zzap-theme", theme);
  },
  async useShiki(props: {
    /**
     * Theme id from https://shiki.matsu.io/themes
     */
    theme: string;
    selector: string;
  }) {
    if (!this.inBrowser) {
      return undefined;
    }

    const zzapRoot = document.querySelector("#zzap-root");

    const shikiCDN = "https://esm.sh/shiki@1.0.0";
    const { codeToHtml } = await import(shikiCDN);

    const promises: Promise<void>[] = [];

    const nodes = document.querySelectorAll(props?.selector);
    nodes.forEach((node) => {
      promises.push(colorize(node as HTMLPreElement));
    });

    await Promise.all(promises);
    zzapRoot?.setAttribute("data-zzap-shiki", "true");
    return document.querySelectorAll(`div[data-zzap-shiki-block="true"]`);

    async function colorize(node: HTMLPreElement) {
      const lang = node.querySelector("code")?.className;
      const code = node.textContent;
      const html = await codeToHtml(code, {
        lang: lang,
        theme: props?.theme || "github-dark",
      });
      let existingZzapShiki = node.nextElementSibling as
        | HTMLDivElement
        | undefined;
      if (existingZzapShiki?.getAttribute("data-zzap-shiki-block") === "true") {
        existingZzapShiki.innerHTML = html;
        return;
      } else {
        node.style.display = "none";
        const newZzapShiki = document.createElement("div");
        newZzapShiki.setAttribute("data-zzap-shiki-block", "true");
        newZzapShiki.innerHTML = html;
        node.after(newZzapShiki);
      }
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
