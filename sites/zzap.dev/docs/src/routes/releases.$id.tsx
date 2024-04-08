import { defineRoute } from "zzap";
import { getRelease } from "./releases";

export default defineRoute({
  async getPathParams(ctx) {
    const releases = await getRelease({
      ctx,
      includePage: true,
    });

    return releases.map((release) => ({
      params: {
        id: release.id,
      },
    }));
  },
  async getPage(props, ctx) {
    const releases = await getRelease({
      ctx: ctx,
      includePage: true,
    });
    const release = releases.find((release) => release.id === props.params.id);

    if (!release) {
      return;
    }

    return {
      ...release,
      layout: "release",
    };
  },
});
