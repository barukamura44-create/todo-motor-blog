export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID || "todo-motor";
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const redirectUri = `${origin}/api/oauth/callback`;
  const state = typeof window !== "undefined" ? btoa(redirectUri) : "";

  if (!oauthPortalUrl) {
    return "/admin";
  }

  try {
    const baseUrl = oauthPortalUrl.startsWith("http") ? oauthPortalUrl : `https://${oauthPortalUrl}`;
    const url = new URL(`${baseUrl}/app-auth`);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");

    return url.toString();
  } catch {
    return "/admin";
  }
};
