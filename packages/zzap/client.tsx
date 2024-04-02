import type { Root } from "react-dom/client";
import { getLogger } from "./src/domains/logging/getLogger";

export type { PageType } from "./src/domains/page/ZzapPageBuilder";

const logger = getLogger("client");
let reactRoot: Root;

let latestUsedShikiProps: Parameters<typeof ZzapClient.useShiki>[0] | undefined;
export const ZzapClient = {
  inBrowser: typeof window !== "undefined",
  async whenInBrowser(callback: () => Promise<void>) {
    if (this.inBrowser) {
      await callback();
    }
  },
  async interactive(RootComponent: any) {
    if (!this.inBrowser) {
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
            JSON.stringify(props) !== JSON.stringify(window.__zzap.props);

          if (propsHaveChanged) {
            logger.log("Props have changed, re-rendering...");
            reactRoot.render(<RootComponent {...props} />);

            if (latestUsedShikiProps) {
              this.useShiki(latestUsedShikiProps);
            }
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

    latestUsedShikiProps = props;
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
    return document.querySelectorAll(props?.selector);

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
