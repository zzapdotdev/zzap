import { inject } from "@vercel/analytics";
import { injectSpeedInsights } from "@vercel/speed-insights";
import { PageType, zzapClient } from "@zzapdotdev/zzap/client";
import clsx from "clsx";
import React, { useEffect } from "react";

zzapClient.shiki({
  theme: "vitesse-dark",
});
zzapClient.interactive(App);

if (zzapClient.isBrowser) {
  inject();
  injectSpeedInsights();
}

const items = [
  {
    title: "What is zzap",
    href: "/docs",
  },
  {
    title: "Installation",
    href: "/docs/installation",
  },
  {
    title: "Quick Start",
    href: "/docs/quick-start",
  },
];

export default function App(props: { page: PageType<"home-page"> }) {
  function toggleTheme() {
    const theme = zzapClient.getTheme();
    const newTheme = theme === "light" ? "dark" : "light";
    zzapClient.setTheme(newTheme);

    window?.document?.documentElement?.setAttribute("data-theme", newTheme);
    if (newTheme === "dark") {
      window?.document?.documentElement?.classList.add("dark");
      window?.document?.documentElement?.classList.add("tw-dark");
    } else {
      window?.document?.documentElement?.classList.remove("tw-dark");
      window?.document?.documentElement?.classList.remove("dark");
    }
  }

  useEffect(() => {
    main();
    async function main() {
      const { default: docsearch } = await import("@docsearch/js");

      docsearch({
        container: "#docsearch",
        appId: "R2IYF7ETH7",
        apiKey: "599cec31baffa4868cae4e79f180729b",
        indexName: "docsearch",
      });
    }
  }, []);

  const isHomePage = props.page.template === "home-page";

  function handleSearchClick() {
    const docSearchButton = document.querySelector(
      "#docsearch button",
    ) as HTMLButtonElement;
    docSearchButton?.click();
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
              <div className="tw-flex tw-items-center tw-gap-2 tw-rounded tw-bg-zinc-100 tw-py-2 tw-pl-2 tw-pr-3 tw-text-sm dark:tw-bg-zinc-700">
                <span>
                  <SearchIcon className="tw-w-[1.25rem]"></SearchIcon>
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
                  toggleTheme();
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
    if (isHomePage) {
      return null;
    }

    return (
      <aside
        className={clsx("tw-hidden tw-flex-shrink-0 tw-flex-grow lg:tw-flex")}
      >
        <nav>
          <details open>
            <summary className="tw-mb-2 tw-text-sm tw-font-bold tw-text-black dark:tw-text-white">
              Introduction
            </summary>
            <ul className="">
              {items.map((item) => {
                const isCurrent = item.href === props.page.path;
                return (
                  <li key={item.href}>
                    <a
                      className={clsx(
                        "secondary tw-ml-0 tw-rounded-none tw-border-2 tw-py-2 tw-text-sm",
                        {
                          "tw-border-black tw-font-medium tw-text-black":
                            isCurrent,
                          "tw-border-zinc-200 ": !isCurrent,
                        },
                      )}
                      style={{
                        borderLeft: "1px solid",
                      }}
                      href={item.href}
                    >
                      {item.title}
                    </a>
                  </li>
                );
              })}
            </ul>
          </details>
        </nav>
      </aside>
    );
  }

  function renderContent() {
    return (
      <div
        className={clsx({
          "tw-w-[100%]": isHomePage,
          "tw-w-[100%] lg:tw-w-[75%]": !isHomePage,
        })}
        dangerouslySetInnerHTML={{
          __html: props.page.type === "markdown" ? props.page.html : "",
        }}
      ></div>
    );
  }

  function renderNavItems(pprops: { className?: string }) {
    return (
      <>
        <li className={clsx("tw-flex tw-justify-end", pprops.className)}>
          <a href="/docs" className="contrast">
            Docs
          </a>
        </li>
        <li className={clsx("tw-flex tw-justify-end", pprops.className)}>
          <a href="/guides" className="contrast">
            Guides
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

function DiscordIcon(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 127.14 96.36"
      stroke="currentColor"
      className={clsx("tw-h-6 tw-w-6", props.className)}
    >
      <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
    </svg>
  );
}

function SunIcon(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={clsx("tw-h-6 tw-w-6", props.className)}
    >
      <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
    </svg>
  );
}

function MoonIcon(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={clsx("tw-h-6 tw-w-6", props.className)}
    >
      <path
        fillRule="evenodd"
        d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function GitHubIcon(props: { className?: string }) {
  return (
    <svg
      width="1024"
      height="1024"
      viewBox="0 0 1024 1024"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx("tw-h-6 tw-w-6", props.className)}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
        transform="scale(64)"
        fill="currentColor"
      />
    </svg>
  );
}

function ZzapIcon(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fillRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      clipRule="evenodd"
      viewBox="0 0 14154 4768"
      stroke="none"
      className={clsx("tw-h-auto tw-w-6", props.className)}
    >
      <g transform="translate(-15000)">
        <g transform="matrix(3.53845 0 0 1.1919 15000 0)">
          <clipPath id="_clip1">
            <path d="M0 0H4000V4000H0z"></path>
          </clipPath>
          <g clipPath="url(#_clip1)">
            <g transform="matrix(3.51845 0 0 10.4456 -1853.01 -13118.9)">
              <g>
                <g>
                  <g transform="translate(0 31.572)">
                    <path
                      fillRule="nonzero"
                      d="M597.044 1500.74v-73.75l75.773-69.2-75.773-6.07-1.515-97.49H836.99v73.75l-71.226 69.71 71.226 5.56 1.515 97.49H597.044z"
                    ></path>
                    <g transform="matrix(.96733 0 0 .84065 390.787 1163)">
                      <clipPath id="_clip2">
                        <path d="M138 108.527H362.3V401.767H138z"></path>
                      </clipPath>
                      <g fillRule="nonzero" clipPath="url(#_clip2)">
                        <path
                          fill="#FFE603"
                          d="M142 490.9c0-.6 3.8-10 11.7-29.4 2.5-6 5.8-14.4 7.5-18.5 2.7-7 7.9-19.6 14.4-35 1.5-3.6 4.1-10.1 5.9-14.5 1.8-4.4 5.9-14.3 9-22 3.2-7.7 7.5-18.3 9.5-23.5 6.6-16.6 18.2-44.6 23.6-57.3 3.8-8.7 4.1-10.7 1.9-10.7-2.4 0-1.8-2.9 3.4-15.6l5-11.9-48-.3c-43.3-.2-47.9-.4-47.9-1.8 0-1.6 2.1-8.7 11.5-38.4 2.3-7.4 6.6-21.1 9.5-30.5 2.9-9.3 7.2-23.1 9.5-30.5 2.3-7.4 6.6-21.1 9.5-30.5 2.9-9.3 7.1-23.1 9.5-30.5 2.3-7.4 6.4-20.5 9-29 2.6-8.5 6.9-22.2 9.5-30.5 2.6-8.2 5.8-18.5 7-22.7l2.4-7.8h67.2c60.3 0 67.2.2 67.8 1.6 1.3 3.4.4 6.1-4.3 13.3-2.7 4.2-10 15.9-16.4 26.1-6.3 10.2-16.3 26.2-22.2 35.5-5.9 9.4-12 19-13.5 21.5s-5.5 9-9 14.5c-18.4 29.1-30.9 49.1-37.3 59.4-2.1 3.5-5.9 9.5-8.3 13.2L235 192h16c16 0 16 0 15.7 2.3l-.2 2.2 89.4-.8.7 2.8c.4 1.6.3 3.4-.2 4.1-2 2.8-20.9 29-33.4 46.4-7.3 10.2-15.4 21.4-18 25-2.6 3.6-9.5 13.3-15.5 21.5-6 8.3-12.9 17.9-15.5 21.5-2.6 3.6-10.5 14.6-17.6 24.5-7.2 9.9-17.2 23.9-22.4 31-5.1 7.2-13.7 19.1-19 26.5-5.3 7.5-13 18.1-17.1 23.7-4.1 5.6-10.4 14.4-14.1 19.5-3.7 5.1-9.9 12.9-13.9 17.3-3.9 4.4-11.2 12.7-16.2 18.5-10.8 12.6-11.7 13.6-11.7 12.9z"
                        ></path>
                        <path
                          fill="#FF8000"
                          d="M155.2 475c3.6-5.1 25.2-35.3 28.8-40.3 8.8-12 19.3-26.6 28-38.7 5.3-7.4 15.7-21.8 23-32 7.3-10.2 15.4-21.4 18-25 2.6-3.6 10.7-14.8 18-25 7.3-10.2 15.4-21.4 18-25 2.6-3.6 9.5-13.2 15.5-21.5 6-8.2 12.9-17.9 15.5-21.5 37.9-52.9 35.7-50 36.4-48 .2.8 1.7 11 3.2 22.6l2.7 21.2-11.9 13.4c-6.6 7.4-18 20.4-25.5 28.9s-24.6 27.8-38 42.9c-13.4 15.2-32.3 36.5-41.9 47.5-28.9 32.8-85.1 96.3-89.5 101l-2.7 3 2.4-3.5zM147.5 273.3c-1.6-3.8-4.3-10.4-6.2-14.8-1.8-4.5-3.3-8.4-3.3-8.8 0-.4 22.7-.7 50.5-.7s50.5.2 50.5.4c0 .3-8.3 21.2-11.7 29.4-.4.9-9.1 1.2-38.8 1.2h-38.3l-2.7-6.7z"
                        ></path>
                        <path
                          fill="#FF9E00"
                          d="M229 194.5c0-.3 2.3-4.2 5.2-8.8 2.8-4.5 7.3-11.7 10-15.9 10.5-17 21.2-34 37.8-60.3 3.5-5.5 7.5-12 9-14.5s7.6-12.1 13.5-21.5c5.9-9.3 15.9-25.3 22.3-35.5 18.1-29.2 22.5-36 23.3-36 .4 0 1.2 3 1.8 6.8.6 3.7 3 15.1 5.2 25.4l4.2 18.7-6.4 9.3c-6.6 9.7-19.7 29.2-21.4 31.9-.5.9-4.1 6.2-8 11.8-3.8 5.6-8.1 12-9.5 14.1-1.4 2.2-9.5 14.2-18 26.7s-19.3 28.5-24 35.5l-8.5 12.8h-18.2c-10.1 0-18.3-.2-18.3-.5z"
                        ></path>
                      </g>
                    </g>
                  </g>
                  <path
                    fillRule="nonzero"
                    strokeWidth="0.08"
                    d="M860.227 1500.74v-73.75l75.772-69.2-75.772-6.07-1.516-97.49h241.459v73.75l-71.22 69.71 71.22 5.56 1.52 97.49H860.227z"
                    transform="translate(0 31.572)"
                  ></path>
                  <path
                    fillRule="nonzero"
                    d="M1232.52 1495.19c-73.75 0-110.63-36.54-110.63-120.74 0-43.1 13.31-74.84 39.91-95.21 26.6-20.38 61.12-30.57 103.56-30.57 34.68 0 63.31 10.36 85.87 31.07 22.56 20.71 33.51 47.9 32.84 81.58l-3.41 133.87h-84.36l-2.66-26.78c-6.73 9.43-15.66 11.62-26.77 17.68-11.11 6.06-22.56 9.1-34.35 9.1z"
                    transform="translate(0 37.128)"
                  ></path>
                  <path
                    fillRule="nonzero"
                    d="M1408.82 1570.45l-4.55-183.37 2.83-139.42h84.36l3.23 32.33c15.49-21.55 38.23-32.33 68.2-32.33 33.68 0 59.52 10.19 77.54 30.56 18.01 20.38 26.69 50.6 26.01 90.68 0 43.44-7.91 76.19-23.74 98.25-15.83 22.06-42.26 27.02-79.31 27.02-24.24 0-44.45-.67-60.61-14.14l-2.53 90.42h-91.43z"
                    transform="translate(-2.96 38.139)"
                  ></path>
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
function ZzapIconGradient(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fillRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      clipRule="evenodd"
      viewBox="0 0 14154 4768"
      stroke="none"
      className={clsx("tw-h-auto tw-w-6", props.className)}
    >
      <g transform="translate(-30153)">
        <g transform="matrix(3.53845 0 0 1.1919 30153.8 0)">
          <clipPath id="_clip1">
            <path d="M0 0H4000V4000H0z"></path>
          </clipPath>
          <g clipPath="url(#_clip1)">
            <g transform="matrix(3.51845 0 0 10.4456 -1853.01 -12789.1)">
              <g>
                <g>
                  <path
                    fill="url(#_Linear2)"
                    fillRule="nonzero"
                    d="M597.044 1500.74v-73.75l75.773-69.2-75.773-6.07-1.515-97.49H836.99v73.75l-71.226 69.71 71.226 5.56 1.515 97.49H597.044z"
                  ></path>
                  <path
                    fill="url(#_Linear3)"
                    fillRule="nonzero"
                    d="M860.227 1500.74v-73.75l75.772-69.2-75.772-6.07-1.516-97.49h241.459v73.75l-71.22 69.71 71.22 5.56 1.52 97.49H860.227z"
                  ></path>
                  <path
                    fill="url(#_Linear4)"
                    fillRule="nonzero"
                    d="M1232.52 1495.19c-73.75 0-110.63-36.54-110.63-120.74 0-43.1 13.31-74.84 39.91-95.21 26.6-20.38 61.12-30.57 103.56-30.57 34.68 0 63.31 10.36 85.87 31.07 22.56 20.71 33.51 47.9 32.84 81.58l-3.41 133.87h-84.36l-2.66-26.78c-6.73 9.43-15.66 11.62-26.77 17.68-11.11 6.06-22.56 9.1-34.35 9.1z"
                    transform="translate(0 5.557)"
                  ></path>
                  <path
                    fill="url(#_Linear5)"
                    fillRule="nonzero"
                    d="M1408.82 1570.45l-4.55-183.37 2.83-139.42h84.36l3.23 32.33c15.49-21.55 38.23-32.33 68.2-32.33 33.68 0 59.52 10.19 77.54 30.56 18.01 20.38 26.69 50.6 26.01 90.68 0 43.44-7.91 76.19-23.74 98.25-15.83 22.06-42.26 27.02-79.31 27.02-24.24 0-44.45-.67-60.61-14.14l-2.53 90.42h-91.43z"
                    transform="translate(-2.96 6.567)"
                  ></path>
                  <g transform="matrix(.96733 0 0 .84065 390.787 1163)">
                    <clipPath id="_clip6">
                      <path d="M138 108.527H362.3V401.767H138z"></path>
                    </clipPath>
                    <g fillRule="nonzero" clipPath="url(#_clip6)">
                      <path
                        fill="#FFE603"
                        d="M142 490.9c0-.6 3.8-10 11.7-29.4 2.5-6 5.8-14.4 7.5-18.5 2.7-7 7.9-19.6 14.4-35 1.5-3.6 4.1-10.1 5.9-14.5 1.8-4.4 5.9-14.3 9-22 3.2-7.7 7.5-18.3 9.5-23.5 6.6-16.6 18.2-44.6 23.6-57.3 3.8-8.7 4.1-10.7 1.9-10.7-2.4 0-1.8-2.9 3.4-15.6l5-11.9-48-.3c-43.3-.2-47.9-.4-47.9-1.8 0-1.6 2.1-8.7 11.5-38.4 2.3-7.4 6.6-21.1 9.5-30.5 2.9-9.3 7.2-23.1 9.5-30.5 2.3-7.4 6.6-21.1 9.5-30.5 2.9-9.3 7.1-23.1 9.5-30.5 2.3-7.4 6.4-20.5 9-29 2.6-8.5 6.9-22.2 9.5-30.5 2.6-8.2 5.8-18.5 7-22.7l2.4-7.8h67.2c60.3 0 67.2.2 67.8 1.6 1.3 3.4.4 6.1-4.3 13.3-2.7 4.2-10 15.9-16.4 26.1-6.3 10.2-16.3 26.2-22.2 35.5-5.9 9.4-12 19-13.5 21.5s-5.5 9-9 14.5c-18.4 29.1-30.9 49.1-37.3 59.4-2.1 3.5-5.9 9.5-8.3 13.2L235 192h16c16 0 16 0 15.7 2.3l-.2 2.2 89.4-.8.7 2.8c.4 1.6.3 3.4-.2 4.1-2 2.8-20.9 29-33.4 46.4-7.3 10.2-15.4 21.4-18 25-2.6 3.6-9.5 13.3-15.5 21.5-6 8.3-12.9 17.9-15.5 21.5-2.6 3.6-10.5 14.6-17.6 24.5-7.2 9.9-17.2 23.9-22.4 31-5.1 7.2-13.7 19.1-19 26.5-5.3 7.5-13 18.1-17.1 23.7-4.1 5.6-10.4 14.4-14.1 19.5-3.7 5.1-9.9 12.9-13.9 17.3-3.9 4.4-11.2 12.7-16.2 18.5-10.8 12.6-11.7 13.6-11.7 12.9z"
                      ></path>
                      <path
                        fill="#FF8000"
                        d="M155.2 475c3.6-5.1 25.2-35.3 28.8-40.3 8.8-12 19.3-26.6 28-38.7 5.3-7.4 15.7-21.8 23-32 7.3-10.2 15.4-21.4 18-25 2.6-3.6 10.7-14.8 18-25 7.3-10.2 15.4-21.4 18-25 2.6-3.6 9.5-13.2 15.5-21.5 6-8.2 12.9-17.9 15.5-21.5 37.9-52.9 35.7-50 36.4-48 .2.8 1.7 11 3.2 22.6l2.7 21.2-11.9 13.4c-6.6 7.4-18 20.4-25.5 28.9s-24.6 27.8-38 42.9c-13.4 15.2-32.3 36.5-41.9 47.5-28.9 32.8-85.1 96.3-89.5 101l-2.7 3 2.4-3.5zM147.5 273.3c-1.6-3.8-4.3-10.4-6.2-14.8-1.8-4.5-3.3-8.4-3.3-8.8 0-.4 22.7-.7 50.5-.7s50.5.2 50.5.4c0 .3-8.3 21.2-11.7 29.4-.4.9-9.1 1.2-38.8 1.2h-38.3l-2.7-6.7z"
                      ></path>
                      <path
                        fill="#FF9E00"
                        d="M229 194.5c0-.3 2.3-4.2 5.2-8.8 2.8-4.5 7.3-11.7 10-15.9 10.5-17 21.2-34 37.8-60.3 3.5-5.5 7.5-12 9-14.5s7.6-12.1 13.5-21.5c5.9-9.3 15.9-25.3 22.3-35.5 18.1-29.2 22.5-36 23.3-36 .4 0 1.2 3 1.8 6.8.6 3.7 3 15.1 5.2 25.4l4.2 18.7-6.4 9.3c-6.6 9.7-19.7 29.2-21.4 31.9-.5.9-4.1 6.2-8 11.8-3.8 5.6-8.1 12-9.5 14.1-1.4 2.2-9.5 14.2-18 26.7s-19.3 28.5-24 35.5l-8.5 12.8h-18.2c-10.1 0-18.3-.2-18.3-.5z"
                      ></path>
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>
      <defs>
        <linearGradient
          id="_Linear2"
          x1="0"
          x2="1"
          y1="0"
          y2="0"
          gradientTransform="matrix(1067.99 0 0 322.79 595.529 1415.62)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#FACC15"></stop>
          <stop offset="1" stopColor="#FDE68A"></stop>
        </linearGradient>
        <linearGradient
          id="_Linear3"
          x1="0"
          x2="1"
          y1="0"
          y2="0"
          gradientTransform="matrix(1067.99 0 0 322.79 595.529 1415.62)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#FACC15"></stop>
          <stop offset="1" stopColor="#FDE68A"></stop>
        </linearGradient>
        <linearGradient
          id="_Linear4"
          x1="0"
          x2="1"
          y1="0"
          y2="0"
          gradientTransform="matrix(1067.99 0 0 322.79 595.529 1415.62)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#FACC15"></stop>
          <stop offset="1" stopColor="#FDE68A"></stop>
        </linearGradient>
        <linearGradient
          id="_Linear5"
          x1="0"
          x2="1"
          y1="0"
          y2="0"
          gradientTransform="matrix(1067.99 0 0 322.79 595.529 1415.62)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#FACC15"></stop>
          <stop offset="1" stopColor="#FDE68A"></stop>
        </linearGradient>
      </defs>
    </svg>
  );
}

function HamburgerIcon(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={clsx("tw-h-6 tw-w-6", props.className)}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
      />
    </svg>
  );
}

function SearchIcon(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className={clsx("tw-h-6 tw-w-6", props.className)}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
  );
}
