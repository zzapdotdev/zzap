import Bun from "bun";
import markdownit from "markdown-it";
import { renderToString } from "react-dom/server";
import { logger } from "../../cli";
import { zZapConfig } from "../config/zZapConfig";

export const zZapBundler = {
  isGenerating: false,
  async generate() {
    if (this.isGenerating) {
      return;
    }
    const timestampMs = Date.now();
    this.isGenerating = true;
    const md = markdownit({
      html: true,
      linkify: true,
    });
    const pageMarkdown = await Bun.file("README.mdx").text();

    logger.info("Building site");

    const pageHTML = md.render(pageMarkdown);

    const config = await zZapConfig.get();
    for (const file of config.cssFiles || []) {
      const css = await Bun.file(file).text();
      await Bun.write("./dist/" + file, css);
    }

    const jsx = config.layout({
      head: <></>,
      children: (
        <>
          <main
            className="container"
            dangerouslySetInnerHTML={{
              __html: pageHTML,
            }}
          ></main>
        </>
      ),
    });
    const html = renderToString(jsx);
    Bun.write("dist/index.html", html);

    const timeDiff = Date.now() - timestampMs;
    logger.info(`Site built in ${timeDiff}ms`);
    this.isGenerating = false;
  },
};
