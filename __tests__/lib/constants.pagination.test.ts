import { describe, expect, it } from "vitest";
import { normalizePaginationParams } from "@/lib/constants";

describe("normalizePaginationParams", () => {
  it("enforces allow-listed page sizes by default", () => {
    expect(normalizePaginationParams("2", "33")).toEqual({
      page: 2,
      pageSize: 20,
    });
  });

  it("allows non-allow-listed page sizes when allowedPageSizes is disabled", () => {
    expect(
      normalizePaginationParams("2", "33", {
        allowedPageSizes: null,
      })
    ).toEqual({
      page: 2,
      pageSize: 33,
    });
  });

  it("clamps to minimum page size when allow-list is disabled", () => {
    expect(
      normalizePaginationParams(2, -3, {
        allowedPageSizes: null,
      })
    ).toEqual({
      page: 2,
      pageSize: 1,
    });
  });
});
