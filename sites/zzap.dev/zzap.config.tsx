import React from "react";
import { defineConfig } from "zzap";

export default defineConfig({
  siteTitle: "zzap.dev",
  contentFolder: "./content",
  outputFolder: "./dist",
  tailwind: true,
  cssFiles: [
    {
      path: "styles.css",
    },
    {
      path: "../../node_modules/@picocss/pico/css/pico.css",
    },
  ],
  layout(props) {
    return (
      <>
        <html lang="en">
          <head>
            <meta charSet="UTF-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />

            <link rel="stylesheet" href="/styles.css" />
            {props.head}
          </head>
          <body className="bg-white text-black dark:bg-zinc-900 dark:text-white">
            <main className="container mx-auto">
              <nav className="mb-16 border-b border-zinc-600 bg-white dark:bg-zinc-900">
                <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-4">
                  <a
                    href="/"
                    className="flex items-center space-x-3 rtl:space-x-reverse"
                  >
                    <span className="self-center whitespace-nowrap text-2xl font-semibold dark:text-white">
                      zzap
                    </span>
                  </a>
                  <button
                    data-collapse-toggle="navbar-default"
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg p-2 text-sm text-zinc-500 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-200 md:hidden dark:text-zinc-400 dark:hover:bg-zinc-700 dark:focus:ring-zinc-600"
                    aria-controls="navbar-default"
                    aria-expanded="false"
                  >
                    <span className="sr-only">Open main menu</span>
                    <svg
                      className="h-5 w-5"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 17 14"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M1 1h15M1 7h15M1 13h15"
                      />
                    </svg>
                  </button>
                  <div
                    className="hidden w-full md:block md:w-auto"
                    id="navbar-default"
                  >
                    <ul className="mt-4 flex flex-col rounded-lg border border-zinc-100 bg-zinc-50 p-4 font-medium md:mt-0 md:flex-row md:space-x-8 md:border-0 md:bg-white md:p-0 rtl:space-x-reverse dark:border-zinc-700 dark:bg-zinc-800 md:dark:bg-zinc-900">
                      <li>
                        <a
                          href="/"
                          className="block rounded bg-yellow-700 px-3 py-2 text-white md:bg-transparent md:p-0 md:text-yellow-700 dark:text-white md:dark:text-yellow-500"
                          aria-current="page"
                        >
                          Home
                        </a>
                      </li>
                      <li>
                        <a
                          href="/guide/getting-started"
                          className="block rounded px-3 py-2 text-zinc-900 hover:bg-zinc-100 md:border-0 md:p-0 md:hover:bg-transparent md:hover:text-yellow-700 dark:text-white dark:hover:bg-zinc-700 dark:hover:text-white md:dark:hover:bg-transparent md:dark:hover:text-yellow-500"
                        >
                          Getting Started
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </nav>
              <div className="prose prose-xl dark:prose-invert w-full max-w-none">
                {props.children}
              </div>
            </main>
          </body>
          <script
            dangerouslySetInnerHTML={{
              __html: `
            
            if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark')
            } else {
              document.documentElement.classList.remove('dark')
            }
            
            // Whenever the user explicitly chooses light mode
            localStorage.theme = 'light'
            
            // Whenever the user explicitly chooses dark mode
            localStorage.theme = 'dark'
            
            // Whenever the user explicitly chooses to respect the OS preference
            localStorage.removeItem('theme')
            `,
            }}
          ></script>
        </html>
      </>
    );
  },
});
