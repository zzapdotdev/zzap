import React from "react";

import { ZzapClient } from "zzap/client";
import { ZzapPageProps } from "zzap/src/domains/page/ZzapPageBuilder";
import { SearchIcon } from "../components/Icons/Icons";
import { Layout } from "../components/Layout/Layout";

ZzapClient.interactive();

export default function NotFound(props: ZzapPageProps) {
  function handleSearchClick() {
    const docSearchButton = document.querySelector(
      "#docsearch button",
    ) as HTMLButtonElement;
    docSearchButton?.click();
  }

  return (
    <Layout {...props}>
      <>
        <h1>Page Not Found</h1>
        <p>
          The page you are looking for does not exist, but you may use the
          search button below to find what you are looking for!
        </p>
        <button
          className=" contrast  outline tw-flex tw-gap-2 tw-px-4 tw-py-2"
          onClick={handleSearchClick}
        >
          <SearchIcon className="tw-point tw-h-6 tw-w-6"></SearchIcon>
          <span>Search a page</span>
        </button>
      </>
    </Layout>
  );
}
