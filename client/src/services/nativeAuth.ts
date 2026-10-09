import { Capacitor } from "@capacitor/core";
import { SocialLogin } from "@capgo/capacitor-social-login";

/**
 * Google Web OAuth 2.0 Client ID.
 * On Android, the Google Credential Manager plugin uses this Web Client ID as the `audience`
 * so that the issued ID Token can be verified by our backend server using Google's public keys.
 */
const GOOGLE_WEB_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID ||
  "635176813194-po8jtns3ivqgaac1l9lqb9fr02lq480l.apps.googleusercontent.com";

let isInitialized = false;

/**
 * Initializes the `@capgo/capacitor-social-login` plugin on native platforms (Android / iOS).
 * Safe to call multiple times (checks `isInitialized` flag).
 */
export async function initNativeSocialLogin(): Promise<void> {
  if (!Capacitor.isNativePlatform() || isInitialized) return;
  try {
    await SocialLogin.initialize({
      google: {
        webClientId: GOOGLE_WEB_CLIENT_ID,
      },
    });
    isInitialized = true;
  } catch (err) {
    console.error("Failed to initialize native SocialLogin plugin:", err);
  }
}

/**
 * Triggers Android Credential Manager bottom-sheet modal.
 * 
 * Returns the Google ID Token string if the user selects an account and authenticates,
 * or null if cancelled / failed.
 */
export async function loginWithNativeGoogle(): Promise<string | null> {
  if (!Capacitor.isNativePlatform()) return null;

  await initNativeSocialLogin();

  const res = await SocialLogin.login({
    provider: "google",
    options: {},
  });

  if (res && res.result && "idToken" in res.result && res.result.idToken) {
    return res.result.idToken;
  }

  return null;
}
