import clsx from "clsx";
import React from "react";
import { zzapClient } from "zzap/client";

export function Root(props: { children: React.ReactNode; content: string }) {
  function toggleTheme() {
    const theme = zzapClient.getTheme();
    const newTheme = theme === "light" ? "dark" : "light";
    zzapClient.setTheme(newTheme);

    document.documentElement.setAttribute("data-theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.add("tw-dark");
    } else {
      document.documentElement.classList.remove("tw-dark");
      document.documentElement.classList.remove("dark");
    }
  }

  return (
    <div
      style={{
        paddingBottom: "20vh",
        background: "var(--pico-background-color)",
      }}
    >
      <main className="container">
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
                  <img
                    src="/images/zzap-logo-light-w500.jpg"
                    alt=""
                    className="tw-w-[8rem] tw-block dark:tw-hidden"
                  />
                  <img
                    src="/images/zzap-logo-dark-w500.jpg"
                    alt=""
                    className="tw-w-[8rem] tw-hidden dark:tw-block"
                  />
                </a>
              </li>
            </ul>
            <ul>
              <li>
                <a href="/docs" className="contrast">
                  Docs
                </a>
              </li>
              <li>
                <a href="/guides" className="contrast">
                  Guides
                </a>
              </li>
              <li>
                <a
                  className="tw-flex tw-cursor-pointer contrast"
                  href="https://zzap.dev/discord"
                >
                  <DiscordIcon></DiscordIcon>
                </a>
              </li>
              <li>
                <a
                  className="tw-flex tw-cursor-pointer contrast"
                  href="https://github.com/zzapdotdev/zzap"
                  target="_blank"
                >
                  <GitHubIcon></GitHubIcon>
                </a>
              </li>
              <li>
                <a
                  className="tw-flex tw-cursor-pointer contrast "
                  onClick={(e) => {
                    e.preventDefault();
                    toggleTheme();
                  }}
                >
                  <MoonIcon className="tw-block dark:tw-hidden"></MoonIcon>
                  <SunIcon className="tw-hidden dark:tw-block" />
                </a>
              </li>
            </ul>
          </nav>
        </header>

        <div className="tw-flex tw-flex-row tw-gap-16">
          <aside className="tw-flex-grow tw-flex-shrink-0 lg:tw-flex tw-hidden ">
            <nav>
              <details open>
                <summary className="tw-font-bold tw-mb-2 tw-text-black dark:tw-text-white tw-text-sm">
                  Introduction
                </summary>
                <ul className="tw-border-l-2  ">
                  <li>
                    <a
                      className="secondary tw-text-sm tw-py-2 tw-ml-0 tw-border-zinc-200 tw-rounded-none"
                      style={{
                        borderLeft: "1px solid",
                      }}
                      href="/docs"
                    >
                      What is zzap
                    </a>
                  </li>
                  <li>
                    <a
                      className="secondary tw-text-sm tw-py-2 tw-ml-0 tw-border-zinc-200 tw-rounded-none"
                      style={{
                        borderLeft: "1px solid",
                      }}
                      href="/docs/installation"
                    >
                      Installation
                    </a>
                  </li>
                  <li>
                    <a
                      className="secondary tw-text-sm tw-py-2 tw-ml-0 tw-border-zinc-200 tw-rounded-none"
                      style={{
                        borderLeft: "1px solid",
                      }}
                      href="/docs/quick-start"
                    >
                      Quick Start
                    </a>
                  </li>
                </ul>
              </details>
            </nav>
          </aside>
          <div
            className="lg:tw-w-[75%] tw-w-[100%]"
            dangerouslySetInnerHTML={{
              __html: props.content,
            }}
          ></div>
        </div>
      </main>
    </div>
  );
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
