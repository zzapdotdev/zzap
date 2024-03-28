import { PageType } from "@zzapdotdev/zzap/client";
import React from "react";

type PageTypes = "home-page";

export default function App(props: { page: PageType<PageTypes> }) {
  return (
    <main>
      <h1>{props.page.title}</h1>
      <pre>
        <code>{JSON.stringify(props, null, 2)}</code>
      </pre>
    </main>
  );
}
