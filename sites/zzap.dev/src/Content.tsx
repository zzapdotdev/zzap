import clsx from "clsx";
import React from "react";

export function Content(props: { children: React.ReactNode }) {
  const [counter, setCounter] = React.useState(0);

  return (
    <div className="bg-white text-black dark:bg-zinc-900 dark:text-white">
      <main className="container mx-auto">
        <nav className="mb-16  border-zinc-600 bg-white dark:bg-zinc-900">
          <Container className="border-b">
            <a
              href="/"
              className="flex items-center space-x-3 rtl:space-x-reverse"
            >
              <ZzapText
                className={
                  "self-center whitespace-nowrap text-2xl font-semibold"
                }
              >
                zzap {counter > 0 ? `(${counter})` : ""}
              </ZzapText>
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
                  <Link href="/" aria-current="page">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/guide/getting-started">Getting Started</Link>
                </li>
              </ul>
            </div>
          </Container>
        </nav>
        <Container className="prose prose-xl dark:prose-invert">
          {props.children}
          {/* <button
            onClick={() => {
              setCounter(counter + 1);
            }}
          >
            Increment
          </button> */}
        </Container>
      </main>
    </div>
  );
}

export function Container(props: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "mx-auto flex w-full max-w-screen-xl flex-wrap items-center justify-between p-4",
        props.className,
      )}
    >
      {props.children}
    </div>
  );
}

export function Link(props: { children: React.ReactNode; href: string }) {
  return (
    <a
      href={props.href}
      className="block rounded px-3 py-2 text-zinc-900 hover:bg-zinc-100 md:border-0 md:p-0 md:hover:bg-transparent md:hover:text-yellow-600 dark:text-white dark:hover:bg-zinc-700 dark:hover:text-white md:dark:hover:bg-transparent md:dark:hover:text-yellow-500"
    >
      {props.children}
    </a>
  );
}

export function ZzapText(props: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "bg-gradient-to-r from-yellow-500 to-yellow-300 bg-clip-text font-bold text-transparent",
        props.className,
      )}
    >
      {props.children}
    </span>
  );
}
