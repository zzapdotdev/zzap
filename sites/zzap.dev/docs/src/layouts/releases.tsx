import React from "react";
import { ZzapClient } from "zzap/client";
import { ZzapPageProps } from "zzap/src/domains/page/ZzapPageBuilder";
import { Layout } from "../components/Layout/Layout";

ZzapClient.interactive();

export default function Releases(
  props: ZzapPageProps & {
    releases: { id: string; title: string; description: string }[];
  },
) {
  return (
    <Layout {...props}>
      <h1>Latest Releases</h1>
      <div className="tw-grid tw-grid-cols-1 tw-gap-2">
        {props.releases.map((release, i) => {
          return (
            <div key={i} className="">
              <a
                href={`/releases/${release.id}`}
                className="tw-text- tw-no-underline"
              >
                <article className="tw-cursor-pointer ">
                  <h3>{release.title} </h3>
                  <p className="tw-text-[color:#373c44] dark:tw-text-[color:#c2c7d0]">
                    {release.description}
                  </p>
                </article>
              </a>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
