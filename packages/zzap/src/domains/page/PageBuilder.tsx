import yaml from "js-yaml";
import markdownit from "markdown-it";

export const PageBuilder = {
  fromMarkdown(props: { path: string; markdown: string }): Array<MarkdownPage> {
    const frontmatterRegex = /---\n(.*?)\n---/s;
    const frontMatter = props.markdown.match(frontmatterRegex)?.[1];
    const data: any = yaml.load(frontMatter || "") || {};
    const {
      title: frontmatterTitle,
      description: frontmatterDescription,
      template: frontmatterTemplate,
      ...rest
    } = data;
    const markdownWithoutFrontmMatter = props.markdown.replace(
      frontmatterRegex,
      "",
    );
    const html = md.render(markdownWithoutFrontmMatter);

    const firstH1 = html.match(/<h1>(.*?)<\/h1>/)?.[1] || "";
    const firstP = html.match(/<p>(.*?)<\/p>/)?.[1] || "";

    const title = frontmatterTitle || firstH1 || "";
    const description = frontmatterDescription || firstP || "";
    const template = frontmatterTemplate || "default";

    const page: MarkdownPage = {
      type: "markdown",
      template: template,
      title: title,
      description: description,
      data: {
        ...rest,
      },
      path: props.path,
      html,
    };

    return [page];
  },
};

type CorePageType<TTemplateType extends string = ""> = {
  title: string;
  description: string;
  path: string;
  template: TTemplateType;
  data: any;
};

type MarkdownPage<TTemplateType extends string = ""> =
  CorePageType<TTemplateType> & {
    type: "markdown";
    html: string;
  };

type DynamicPageType<TTemplateType extends string = ""> =
  CorePageType<TTemplateType> & {
    type: "dynamic";
    toto: string;
  };

export type PageType<TTemplateType extends string = ""> =
  | MarkdownPage<TTemplateType>
  | DynamicPageType<TTemplateType>;

const md = markdownit({
  html: true,
  linkify: true,
  langPrefix: "",
});
