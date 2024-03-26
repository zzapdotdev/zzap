import { inject } from "@vercel/analytics";
import { injectSpeedInsights } from "@vercel/speed-insights";
import { zzapClient } from "zzap/client";
import { Root } from "./Root";

zzapClient.shiki({
  theme: "vitesse-dark",
});
zzapClient.registerRoot(Root);

inject();
injectSpeedInsights();
