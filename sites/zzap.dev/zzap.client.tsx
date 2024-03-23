import React from "react";
import { hydrateRoot } from "react-dom/client";

const root = document.querySelector("#zzap-id");

if (root) {
  hydrateRoot(root, <div {...(window as any).__zzap.props} />);
}
