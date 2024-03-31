import type { Root } from "react-dom/client";
import { getLogger } from "./src/domains/logging/getLogger";

export type { PageType } from "./src/domains/page/ZzapPageBuilder";

const logger = getLogger("client");
let reactRoot: Root;

export const ZzapClient = {
  isBrowser: typeof window !== "undefined",
  async interactive(RootComponent: any) {
    if (!this.isBrowser) {
      return;
    }

    const ReactDOMClient = await import("react-dom/client");
    const hydrateRoot = ReactDOMClient.hydrateRoot;

    const zzapRoot = document.querySelector("#zzap-root");

    if (zzapRoot) {
      reactRoot = hydrateRoot(
        zzapRoot,
        <RootComponent {...window.__zzap.props} />,
      );
    } else {
      logger.error("No #zzap-root element found");
    }

    const isDev = zzapRoot?.getAttribute("data-zzap-dev");
    if (isDev === "true") {
      var ws = new WebSocket(`ws://${location.host}`);

      ws.onopen = function () {
        logger.log("Connected to dev server");
      };

      ws.onmessage = async function (event) {
        if (event.data === "zzap:reload") {
          logger.log("Change detected");

          const response = await fetch(
            `/__zzap/data/${location.pathname}/props.json`,
          );
          const props = await response.json();

          const propsHaveChanged =
            JSON.stringify(props) !== JSON.stringify(window.__zzap.props);

          if (propsHaveChanged) {
            logger.log("Props have changed, re-rendering...");
            reactRoot.render(<RootComponent {...props} />);
          } else {
            logger.log("Props have not changed, reloading...");
            window.location.reload();
          }
        }
      };

      ws.onclose = function () {
        logger.log("Disconnected from dev server");
      };

      ws.onerror = function (error) {
        logger.error(`WebSocket error: ${error}`);
      };
    }
  },
  getTheme() {
    if (!this.isBrowser) {
      return;
    }
    const currentTheme =
      document.documentElement.getAttribute("data-zzap-theme");
    return currentTheme as "light" | "dark";
  },
  setTheme(theme: "light" | "dark") {
    if (!this.isBrowser) {
      return;
    }
    document.documentElement.setAttribute("data-zzap-theme", theme);
    localStorage.setItem("zzap-theme", theme);
  },
  async shiki(props?: {
    /**
     * Theme id from https://shiki.matsu.io/themes
     */
    theme: string;
  }) {
    if (!this.isBrowser) {
      return;
    }
    const zzapRoot = document.querySelector("#zzap-root");

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
