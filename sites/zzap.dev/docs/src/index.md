---
title: zzap The content site generator for React, and it's... really fast
description: Add zzap to your project, include some markdown files, and trust zzap to build your site in milliseconds.
---

<div
  class="tw-mb-16 tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-6"
>
  <h3 class="tw-m-0 tw-text-[20pt] tw-text-center">The content site generator for React</h3>
  <h2
    class="tw-m-0  tw-text-center tw-text-[50pt] tw-font-extrabold tw-leading-none"
  >
    and it's like...
    <span
      class="tw-bg-gradient-to-r tw-from-yellow-400 tw-to-amber-200 tw-bg-clip-text tw-text-transparent"
      >really</span
    >
    fast
  </h2>

<div class="[&_*]:tw-m-0">

```sh
$ zzap build
$ Building zzap.dev...
$ Site built in 23ms.
```

</div>

  <span class="tw-text-sm tw-text-center tw-w-8/12 ">
    This is the real build time of building this entire documentation website
    with zzap, excluding the time it took for Tailwind CSS to generate the
    styles (~300-500ms)
  </span>

  <div class="tw-flex tw-gap-4">
    <a href="/docs/intro/installation" class="tw-flex" role="button">
      Install zzap
    </a>
    <a href="/docs/intro/what-is-zzap" class="tw-flex contrast outline" role="button">
      What is zzap
    </a>
  </div>
</div>

<div class="tw-container tw-max-w-[960px] tw-mx-auto">

## In a nutshell

Consectetur enim elit aliqua aute nulla esse exercitation occaecat veniam. Magna est consequat consectetur laboris ut nulla nostrud qui ullamco nostrud. Sint exercitation irure excepteur incididunt aute culpa duis cupidatat duis. Ad aliquip exercitation labore consectetur ea eu labore sint esse.

Fugiat consequat reprehenderit incididunt nulla proident veniam. Labore aliquip fugiat voluptate eu. Sint magna aliquip id ullamco in nisi minim id nostrud cupidatat non do. Dolor sit ad ex in consectetur ullamco. Magna culpa sint aliqua occaecat ipsum. Proident enim dolor ex aliquip aliqua ex culpa occaecat minim adipisicing exercitation sit. Est elit sunt velit pariatur.

Est eu occaecat non anim ex nisi labore fugiat cillum Lorem ullamco. Nostrud exercitation incididunt officia elit et eiusmod id eiusmod. Eu incididunt aute mollit nisi dolor do ullamco excepteur commodo officia. Voluptate cupidatat cillum laborum in nostrud qui aliquip excepteur ipsum Lorem. Sit do dolore et nostrud est aliqua proident Lorem amet nostrud magna. Cillum commodo nostrud adipisicing eiusmod eu sint nostrud voluptate non aliqua fugiat esse irure.

---

**Install zzap**

```sh
$ bun install zzap
```

---

## Quick Setup

```tsx
import { defineConfig } from "@zzapdotdev/zzap";
import React from "react";
import Server from "react-dom/server";

export default defineConfig({
  title: "My Website",
  deps: {
    "react-dom/server": Server,
  },
  document(props) {
    return (
      <>
        <html lang="en">
          <head>
            <meta charSet="UTF-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
            {props.head}
          </head>
          <body>{props.children}</body>
          {props.scripts}
        </html>
      </>
    );
  },
});
```

```tsx
import { PageType } from "@zzapdotdev/zzap/client";
import React from "react";

type PageTypes = "";

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
```

```md
# Home Page
```

## Features

Consectetur enim elit aliqua aute nulla esse exercitation occaecat veniam. Magna est consequat consectetur laboris ut nulla nostrud qui ullamco nostrud. Sint exercitation irure excepteur incididunt aute culpa duis cupidatat duis. Ad aliquip exercitation labore consectetur ea eu labore sint esse.

Fugiat consequat reprehenderit incididunt nulla proident veniam. Labore aliquip fugiat voluptate eu. Sint magna aliquip id ullamco in nisi minim id nostrud cupidatat non do. Dolor sit ad ex in consectetur ullamco. Magna culpa sint aliqua occaecat ipsum. Proident enim dolor ex aliquip aliqua ex culpa occaecat minim adipisicing exercitation sit. Est elit sunt velit pariatur.

Est eu occaecat non anim ex nisi labore fugiat cillum Lorem ullamco. Nostrud exercitation incididunt officia elit et eiusmod id eiusmod. Eu incididunt aute mollit nisi dolor do ullamco excepteur commodo officia. Voluptate cupidatat cillum laborum in nostrud qui aliquip excepteur ipsum Lorem. Sit do dolore et nostrud est aliqua proident Lorem amet nostrud magna. Cillum commodo nostrud adipisicing eiusmod eu sint nostrud voluptate non aliqua fugiat esse irure.

Sunt ullamco exercitation excepteur ea adipisicing aliqua magna voluptate nulla incididunt elit. Culpa et nostrud voluptate non pariatur sunt nisi exercitation. Labore eu amet duis dolore incididunt. Ex deserunt qui voluptate duis excepteur cupidatat voluptate dolor ut. Sit ex proident fugiat nulla dolor velit anim incididunt nisi proident ullamco laboris anim. Incididunt proident tempor officia ex ut sunt non sit est culpa.

Commodo laborum aliqua nisi aliqua est aute cillum ad laborum incididunt magna cupidatat sint eiusmod. Commodo anim officia pariatur non nostrud laboris. Ea nostrud ad dolor. Labore laboris tempor labore pariatur irure voluptate. Duis excepteur ea fugiat commodo adipisicing eu adipisicing occaecat enim deserunt.

Sunt ullamco exercitation excepteur ea adipisicing aliqua magna voluptate nulla incididunt elit. Culpa et nostrud voluptate non pariatur sunt nisi exercitation. Labore eu amet duis dolore incididunt. Ex deserunt qui voluptate duis excepteur cupidatat voluptate dolor ut. Sit ex proident fugiat nulla dolor velit anim incididunt nisi proident ullamco laboris anim. Incididunt proident tempor officia ex ut sunt non sit est culpa.

Commodo laborum aliqua nisi aliqua est aute cillum ad laborum incididunt magna cupidatat sint eiusmod. Commodo anim officia pariatur non nostrud laboris. Ea nostrud ad dolor. Labore laboris tempor labore pariatur irure voluptate. Duis excepteur ea fugiat commodo adipisicing eu adipisicing occaecat enim deserunt.

</div>
