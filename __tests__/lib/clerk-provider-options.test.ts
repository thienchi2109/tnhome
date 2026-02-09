import { describe, expect, it } from "vitest";
import { buildPublishableKey } from "@clerk/shared";
import {
  DEV_CLERK_JS_CDN_URL,
  resolveClerkJSUrl,
} from "@/lib/clerk-provider-options";

const buildDevelopmentKey = (frontendApi: string) =>
  buildPublishableKey(frontendApi).replace(/^pk_live_/, "pk_test_");

describe("resolveClerkJSUrl", () => {
  it("returns explicit Clerk JS URL when provided", () => {
    const explicitUrl = "https://example.com/clerk.browser.js";

    expect(
      resolveClerkJSUrl({
        nodeEnv: "development",
        publishableKey: buildPublishableKey("clerk.giadungtnhome.io.vn"),
        explicitClerkJsUrl: explicitUrl,
      })
    ).toBe(explicitUrl);
  });

  it("uses CDN fallback in development for custom-domain production keys", () => {
    expect(
      resolveClerkJSUrl({
        nodeEnv: "development",
        publishableKey: buildPublishableKey("clerk.giadungtnhome.io.vn"),
      })
    ).toBe(DEV_CLERK_JS_CDN_URL);
  });

  it("does not force CDN fallback for development instance keys", () => {
    expect(
      resolveClerkJSUrl({
        nodeEnv: "development",
        publishableKey: buildDevelopmentKey("example.clerk.accounts.dev"),
      })
    ).toBeUndefined();
  });

  it("does not use fallback outside development", () => {
    expect(
      resolveClerkJSUrl({
        nodeEnv: "production",
        publishableKey: buildPublishableKey("clerk.giadungtnhome.io.vn"),
      })
    ).toBeUndefined();
  });
});
