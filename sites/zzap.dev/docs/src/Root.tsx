import clsx from "clsx";
import React from "react";

export function Root(props: { children: React.ReactNode; content: string }) {
  const [themeMode, setThemeMode] = React.useState<"light" | "dark" | "auto">(
    () => {
      if (typeof window === "undefined") return "auto";

      if (document.documentElement.classList.contains("tw-dark")) {
        return "dark";
      }
      return "light";
    },
  );

  function toggleTheme() {
    const newMode = themeMode === "light" ? "dark" : "light";
    setThemeMode(newMode);
    localStorage.setItem("zzap-theme", newMode);

    document.documentElement.setAttribute("data-theme", newMode);
    if (newMode === "dark") {
      document.documentElement.classList.add("tw-dark");
    } else {
      document.documentElement.classList.remove("tw-dark");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        paddingBottom: "20vh",
        background: "var(--pico-background-color)",
      }}
    >
      <main className="container">
        <nav className="tw-mb-[6rem]">
          <ul>
            <li>
              <a href="/">
                <img
                  src="/zzap-logo-light.png"
                  alt=""
                  className="tw-w-[8rem] tw-pt-[1rem] tw-block dark:tw-hidden"
                />
                <img
                  src="/zzap-logo-dark.png"
                  alt=""
                  className="tw-w-[8rem] tw-pt-[1rem] tw-hidden dark:tw-block"
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

        <div className="">
          <div
            dangerouslySetInnerHTML={{
              __html: props.content,
            }}
          ></div>
        </div>
      </main>
    </div>
  );
}

function SunIcon(props: { className?: string }) {
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
        d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
      />
    </svg>
  );
}

function MoonIcon(props: { className?: string }) {
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
        d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
      />
    </svg>
  );
}
