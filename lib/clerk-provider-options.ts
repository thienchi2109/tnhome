import { parsePublishableKey } from "@clerk/shared";

export const DEV_CLERK_JS_CDN_URL =
  "https://cdn.jsdelivr.net/npm/@clerk/clerk-js@5/dist/clerk.browser.js";

interface ResolveClerkJSUrlOptions {
  nodeEnv?: string;
  publishableKey?: string;
  explicitClerkJsUrl?: string;
}

const CLERK_DEVELOPMENT_HOST_SUFFIXES = [".clerk.accounts.dev", ".lcl.dev"];

function isClerkDevelopmentFrontendApi(frontendApi: string): boolean {
  return CLERK_DEVELOPMENT_HOST_SUFFIXES.some((suffix) =>
    frontendApi.endsWith(suffix)
  );
}

/**
 * In local development, production custom-domain publishable keys can fail to load
 * Clerk JS if the custom domain is unavailable. Fall back to Clerk's CDN script.
 */
export function resolveClerkJSUrl({
  nodeEnv,
  publishableKey,
  explicitClerkJsUrl,
}: ResolveClerkJSUrlOptions): string | undefined {
  if (explicitClerkJsUrl) {
    return explicitClerkJsUrl;
  }

  if (nodeEnv !== "development") {
    return undefined;
  }

  const parsedPublishableKey = parsePublishableKey(publishableKey ?? "");
  if (!parsedPublishableKey) {
    return undefined;
  }

  const isProductionInstance = parsedPublishableKey.instanceType === "production";
  const isCustomFrontendApi = !isClerkDevelopmentFrontendApi(
    parsedPublishableKey.frontendApi
  );

  if (isProductionInstance && isCustomFrontendApi) {
    return DEV_CLERK_JS_CDN_URL;
  }

  return undefined;
}
