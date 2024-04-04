import React from "react";
import "zzap/client";
import { ZzapClient } from "zzap/client";
import { ZzapPageProps } from "zzap/src/domains/page/ZzapPageBuilder";
import { Layout } from "../components/Layout/Layout";

ZzapClient.interactive();

export default function Default(props: ZzapPageProps) {
  return (
    <Layout {...props}>
      <>
        {props.markdown?.html && (
          <div
            dangerouslySetInnerHTML={{
              __html: props.markdown?.html,
            }}
          ></div>
        )}
      </>
    </Layout>
  );
}
