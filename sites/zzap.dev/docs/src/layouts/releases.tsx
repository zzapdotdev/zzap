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
      <div className="tw-grid tw-grid-cols-3 tw-gap-2">
        {props.releases.map((release, i) => {
          return (
            <div key={i} className="">
              <article>
                <h3>{release.title} </h3>
                <p>{release.description}</p>
                <div>
                  <a href={`/releases/${release.id}`}>Read more</a>
                </div>
              </article>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
