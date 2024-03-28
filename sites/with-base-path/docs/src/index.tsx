import React from "react";
import { ZzapClientPageType } from "zzap/client";

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
