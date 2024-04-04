import { describe, expect, it } from "bun:test";
import { WebPath } from "./WebPath";

describe("Path", () => {
  describe("join", () => {
    it("should join url segments into a single path that always starts with a slash and never ends with a slash", () => {
      expect(WebPath.join("segment1", "segment2")).toBe("/segment1/segment2");
      expect(WebPath.join("/segment1", "/segment2")).toBe("/segment1/segment2");
      expect(WebPath.join("segment1/", "segment2/")).toBe("/segment1/segment2");
      expect(WebPath.join("/segment1/", "/segment2/")).toBe(
        "/segment1/segment2",
      );
    });

    it("should return a path that starts with a slash when given an empty string", () => {
      expect(WebPath.join("")).toBe("/");
    });

    it("should return a path that starts with a slash when given no arguments", () => {
      expect(WebPath.join()).toBe("/");
    });

    it("should handle segments that start with a slash", () => {
      expect(WebPath.join("/segment1", "segment2")).toBe("/segment1/segment2");
    });

    it("should handle segments that do not start with a slash", () => {
      expect(WebPath.join("segment1", "/segment2")).toBe("/segment1/segment2");
    });

    it("should handle single segments full of slash", () => {
      expect(WebPath.join("/this/is/a////single//segment/")).toBe(
        "/this/is/a/single/segment",
      );
    });
  });
});
