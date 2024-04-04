import { inject as injectVercelAnalytics } from "@vercel/analytics";
import { injectSpeedInsights as injectVercelSpeedInsights } from "@vercel/speed-insights";
import clsx from "clsx";
import React, { useEffect } from "react";
import { TemplateProps, Templates, ZzapClient } from "zzap/client";
import { RenderedPageType } from "zzap/src/domains/page/ZzapPageBuilder";
import {
  DiscordIcon,
  GitHubIcon,
  HamburgerIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
  ZzapIcon,
  ZzapIconGradient,
} from "./components/Icons";
import { sidebars } from "./sidebars";
ZzapClient.interactive(App);

ZzapClient.whenInBrowser(async () => {
  injectVercelAnalytics();
  injectVercelSpeedInsights();
});

export default function App(props: { page: RenderedPageType }) {
  const visibleSidebars = sidebars.filter((sidebar) => {
    return props.page.path.startsWith(sidebar.path);
  });
  const chapters = visibleSidebars.flatMap((sidebar) => sidebar.chapters);
  const hasSidebar = chapters.length > 0;

  useEffect(() => {
    // algoila
    setupAlgoliaDocSearch();
    async function setupAlgoliaDocSearch() {
      const { default: docsearch } = await import("@docsearch/js");

      docsearch({
        container: "#docsearch",
        appId: "IXJOX9MAXK",
        apiKey: "a2c40fcb6b525276ff29463b163b4f46",
        indexName: "zzap",
      });
    }
  }, []);

  useEffect(() => {
    // shiki
    (async () => {
      const nodes = await ZzapClient.useShiki({
        theme: "rose-pine",
        selector: "pre:has(code)",
      });

      nodes?.forEach((node) => {
        const copyCodeButton = document.createElement("div");

        copyCodeButton.innerText = "Copy";
        copyCodeButton.classList.add("zzap-copy-code-button");
        copyCodeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="tw-w-4 tw-h-4">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
      </svg>
      `;

        copyCodeButton.onclick = (event) => {
          navigator.clipboard.writeText(node.textContent?.trim() || "");
          copyCodeButton.classList.add("copied");

          setTimeout(() => {
            copyCodeButton.classList.remove("copied");
          }, 1000);
        };

        node.appendChild(copyCodeButton);
      });
    })();
  });

  function handleSearchClick() {
    const docSearchButton = document.querySelector(
      "#docsearch button",
    ) as HTMLButtonElement;
    docSearchButton?.click();
  }

  function handleToggleTheme() {
    const theme = ZzapClient.getTheme();
    const newTheme = theme === "light" ? "dark" : "light";
    ZzapClient.setTheme(newTheme);

    window?.document?.documentElement?.setAttribute("data-theme", newTheme);
    if (newTheme === "dark") {
      window?.document?.documentElement?.classList.add("dark");
      window?.document?.documentElement?.classList.add("tw-dark");
    } else {
      window?.document?.documentElement?.classList.remove("tw-dark");
      window?.document?.documentElement?.classList.remove("dark");
    }
  }

  return (
    <main
      className="container pico"
      style={{
        paddingBottom: "20vh",
      }}
    >
      {renderHeader()}
      <div id="docsearch"></div>

      <div className="tw-flex tw-flex-row tw-gap-16">
        {renderSidebar()}
        {renderContent()}
      </div>
    </main>
  );

  function renderHeader() {
    return (
      <header>
        <nav
          className="tw-mb-[3rem] tw-border tw-border-zinc-200 dark:tw-border-zinc-600"
          style={{
            borderBottom: "1px solid ",
          }}
        >
          <ul>
            <li>
              <a href="/">
                <ZzapIcon className="tw-block tw-w-[5rem] tw-pt-1 tw-text-black md:tw-w-[10rem]  md:tw-pt-2 dark:tw-hidden dark:tw-text-white "></ZzapIcon>
                <ZzapIconGradient className=" tw-hidden tw-w-[5rem] tw-pt-1 tw-text-black  md:tw-w-[10rem] md:tw-pt-2 dark:tw-block dark:tw-text-white"></ZzapIconGradient>
              </a>
            </li>
            <li onClick={handleSearchClick} className="tw-hidden md:tw-block">
              <div className="tw-flex tw-min-w-[250px] tw-items-center tw-gap-2 tw-rounded tw-bg-zinc-100 tw-py-1 tw-pl-2 tw-pr-2 tw-text-xs dark:tw-bg-zinc-700">
                <span>
                  <SearchIcon className="tw-w-[1.25em]"></SearchIcon>
                </span>
                <span>Search the doc...</span>
              </div>
            </li>
          </ul>
          <ul>
            {renderNavItems({
              className: "tw-hidden lg:tw-block",
            })}
            <li
              onClick={handleSearchClick}
              className="tw-block tw-cursor-pointer md:tw-hidden"
            >
              <SearchIcon className="tw-w-[1.25rem]"></SearchIcon>
            </li>
            <li>
              <a
                className="contrast tw-flex tw-cursor-pointer "
                onClick={(e) => {
                  e.preventDefault();
                  handleToggleTheme();
                }}
              >
                <MoonIcon className="tw-block dark:tw-hidden"></MoonIcon>
                <SunIcon className="tw-hidden dark:tw-block" />
              </a>
            </li>
            <li className="tw-block lg:tw-hidden">
              <details className="dropdown tw-m-0 tw-p-0">
                <summary className="tw-border-0 tw-bg-transparent after:tw-hidden">
                  <HamburgerIcon></HamburgerIcon>
                </summary>
                <ul dir="rtl">{renderNavItems({})}</ul>
              </details>
            </li>
          </ul>
        </nav>
      </header>
    );
  }

  function renderSidebar() {
    if (!visibleSidebars.length) {
      return null;
    }

    return (
      <aside
        className={clsx("tw-hidden tw-flex-shrink-0 tw-flex-grow lg:tw-flex")}
      >
        <nav>
          {chapters.map((chapter, i) => {
            const items = props.page.sitemap?.filter((item) => {
              return item.path.startsWith(chapter.path);
            });
            return (
              <details open key={i}>
                <summary className="tw-mb-2 tw-text-sm tw-font-bold tw-text-black dark:tw-text-white">
                  {chapter.name}
                </summary>
                <ul className="">
                  {items?.map((item) => {
                    const isCurrent = item.path === props.page.path;
                    return (
                      <li key={item.path}>
                        <a
                          className={clsx(
                            "secondary tw-ml-0 tw-rounded-none tw-border-2 tw-py-2 tw-text-sm",
                            {
                              "tw-border-black tw-font-medium tw-text-black dark:tw-border-white dark:tw-text-white":
                                isCurrent,
                              "tw-border-zinc-200 ": !isCurrent,
                            },
                          )}
                          style={{
                            borderLeft: "1px solid",
                          }}
                          href={item.path}
                        >
                          {item.title}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </details>
            );
          })}
        </nav>
      </aside>
    );
  }

  function renderContent() {
    return (
      <div
        className={clsx({
          "tw-w-[100%]": !hasSidebar,
          "tw-w-[100%] lg:tw-w-[75%]": hasSidebar,
        })}
      >
        <Templates
          page={props.page}
          templates={{
            default(templateProps: TemplateProps) {
              const html = templateProps.page.data.html;
              return (
                <>
                  {html && (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: html,
                      }}
                    ></div>
                  )}
                </>
              );
            },
            ["404"](templateProps: TemplateProps) {
              return (
                <>
                  <h1>Page Not Found</h1>
                  <p>
                    The page you are looking for does not exist, but you may use
                    the search button below to find what you are looking for!
                  </p>
                  <button
                    className=" contrast  outline tw-flex tw-gap-2 tw-px-4 tw-py-2"
                    onClick={handleSearchClick}
                  >
                    <SearchIcon className="tw-point tw-h-6 tw-w-6"></SearchIcon>
                    <span>Search a page</span>
                  </button>
                </>
              );
            },
            releases(
              templateProps: TemplateProps<{
                releases: Array<{
                  title: string;
                  description: string;
                  id: string;
                }>;
              }>,
            ) {
              const releases = templateProps.page.data.releases;
              return (
                <div>
                  <h1>Latest Releases</h1>
                  <div className="tw-grid tw-grid-cols-3 tw-gap-2">
                    {releases.map((release, i) => {
                      return (
                        <div key={i} className="">
                          <article>
                            <h3>{release.title} </h3>
                            <p>{release.description}</p>
                            <div>
                              <a href={`/releases/${release.id}`}>Read more</a>
                            </div>
                          </article>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            },
            release(templateProps: TemplateProps<{}>) {
              return (
                <div>
                  {templateProps.page.data.html && (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: templateProps.page.data.html,
                      }}
                    ></div>
                  )}
                </div>
              );
            },
          }}
        ></Templates>
      </div>
    );
  }

  function renderNavItems(pprops: { className?: string }) {
    return (
      <>
        <li className={clsx("tw-flex tw-justify-end", pprops.className)}>
          <a href="/docs/intro/what-is-zzap" className="contrast">
            Docs
          </a>
        </li>
        <li className={clsx("tw-flex tw-justify-end", pprops.className)}>
          <a href="/guides" className="contrast">
            Guides
          </a>
        </li>
        <li className={clsx("tw-flex tw-justify-end", pprops.className)}>
          <a href="/releases" className="contrast">
            Releases
          </a>
        </li>
        <li className={clsx("tw-flex tw-justify-end", pprops.className)}>
          <a
            className="contrast tw-flex tw-cursor-pointer"
            href="https://zzap.dev/discord"
          >
            <DiscordIcon className="tw-hidden lg:tw-block"></DiscordIcon>
            <span className="tw-block lg:tw-hidden">Discord</span>
          </a>
        </li>
        <li className={clsx("tw-flex tw-justify-end", pprops.className)}>
          <a
            className="contrast tw-flex tw-cursor-pointer"
            href="https://github.com/zzapdotdev/zzap"
            target="_blank"
          >
            <GitHubIcon className="tw-hidden lg:tw-block"></GitHubIcon>
            <span className="tw-block lg:tw-hidden">GitHub</span>
          </a>
        </li>
      </>
    );
  }
}
