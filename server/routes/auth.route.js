import express from "express";

const router = express.Router();

/**
 * POST /api/auth/google-native
 * 
 * Authenticates an Android native mobile user via Google Sign-In.
 * 
 * Why this endpoint exists:
 * - On Android mobile apps (Capacitor/WebView), standard browser OAuth redirections
 *   open external Chrome and attempt to redirect back to localhost, resulting in broken handshakes.
 * - Clerk's client-side OneTap also expects web FedCM tokens and rejects native mobile tokens.
 * - This endpoint bridges Android Credential Manager tokens with Clerk:
 *   1. Verifies the Google ID token cryptographically with Google's OAuth2 API.
 *   2. Extracts the verified email and user profile details.
 *   3. Finds or automatically provisions the user in Clerk via the Clerk Backend API.
 *   4. Generates a short-lived Clerk Sign-In Ticket (JWT).
 *   5. Returns the ticket so the mobile client can log in instantly via `signIn.create({ strategy: 'ticket' })`.
 */
router.post("/google-native", async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            return res.status(400).json({ error: "Missing Google ID token" });
        }

        // Step 1: Verify token authenticity with Google's public tokeninfo endpoint
        const googleRes = await fetch(
            `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
        );
        if (!googleRes.ok) {
            const errText = await googleRes.text();
            console.error("Google token verification failed:", errText);
            return res.status(401).json({ error: "Invalid Google token signature or expiration" });
        }

        const googlePayload = await googleRes.json();
        const email = googlePayload.email;
        const name = googlePayload.name || googlePayload.given_name || "Lifter";
        const picture = googlePayload.picture;

        if (!email) {
            return res.status(400).json({ error: "No email address associated with this Google account" });
        }

        const secretKey = process.env.CLERK_SECRET_KEY;
        if (!secretKey) {
            return res.status(500).json({ error: "Clerk secret key is not configured on the server" });
        }

        // Step 2: Check if a Clerk user already exists with this email address
        const usersRes = await fetch(
            `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`,
            {
                headers: { Authorization: `Bearer ${secretKey}` },
            }
        );

        let clerkUser = null;
        if (usersRes.ok) {
            const users = await usersRes.json();
            if (Array.isArray(users) && users.length > 0) {
                clerkUser = users[0];
            }
        }

        // Step 3: If no user exists, create a new Clerk account for this Google user
        if (!clerkUser) {
            const createRes = await fetch("https://api.clerk.com/v1/users", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${secretKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email_address: [email],
                    first_name: name,
                    profile_image_url: picture,
                    skip_password_requirement: true,
                }),
            });

            if (!createRes.ok) {
                const errData = await createRes.json();
                console.warn("Initial Clerk user creation response:", errData);

                // In case of race conditions, re-query the user list
                const retryUsersRes = await fetch(
                    `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`,
                    {
                        headers: { Authorization: `Bearer ${secretKey}` },
                    }
                );
                if (retryUsersRes.ok) {
                    const retryUsers = await retryUsersRes.json();
                    if (Array.isArray(retryUsers) && retryUsers.length > 0) {
                        clerkUser = retryUsers[0];
                    }
                }

                if (!clerkUser) {
                    return res.status(500).json({
                        error: errData?.errors?.[0]?.message || "Failed to create Clerk account for user",
                    });
                }
            } else {
                clerkUser = await createRes.json();
            }
        }

        // Step 4: Issue a Clerk Sign-In Ticket for the user
        const tokenRes = await fetch("https://api.clerk.com/v1/sign_in_tokens", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${secretKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: clerkUser.id }),
        });

        if (!tokenRes.ok) {
            const errData = await tokenRes.json();
            console.error("Failed to create Clerk sign-in ticket:", errData);
            return res.status(500).json({ error: "Failed to generate sign-in ticket" });
        }

        const tokenData = await tokenRes.json();
        return res.json({ token: tokenData.token });
    } catch (err) {
        console.error("Native Google auth route error:", err);
        return res.status(500).json({ error: err.message || "Internal server error during authentication" });
    }
});

export default router;
