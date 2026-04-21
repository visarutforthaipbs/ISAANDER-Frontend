import { createClient, OAuthStrategy } from "@wix/sdk";
import { posts, categories } from "@wix/blog";
import { members } from "@wix/members";

const wixClientId = process.env.WIX_CLIENT_ID;
if (!wixClientId) {
  throw new Error("WIX_CLIENT_ID environment variable is required");
}

const wixClient = createClient({
  modules: { posts, categories, members },
  auth: OAuthStrategy({
    clientId: wixClientId,
  }),
});

export default wixClient;
