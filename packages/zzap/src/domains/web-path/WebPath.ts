export const WebPath = {
  /**
   * Join url segments into a single path that always starts with a slash and never ends with a slash removing extra slashes when needed.
   * @param segments
   * @returns
   */
  join(...segments: string[]): string {
    let path = "/";

    for (const segment of segments) {
      segment.split("/").forEach((segment) => {
        if (segment) {
          path += segment + "/";
        }
      });
    }

    if (path === "/") {
      return path;
    }

    return path.slice(0, -1);
  },
};
