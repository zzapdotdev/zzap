import { ZzapClientPageType } from "@zzapdotdev/zzap/client";
import React from "react";

export default function App(props: { page: ZzapClientPageType }) {
  return (
    <main>
      <h1>{props.page.title}</h1>
      <pre>
        <code>{JSON.stringify(props, null, 2)}</code>
      </pre>
    </main>
  );
}
