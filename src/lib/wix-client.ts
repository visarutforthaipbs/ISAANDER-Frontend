import { createClient, OAuthStrategy } from "@wix/sdk";
import { posts, categories } from "@wix/blog";
import { members } from "@wix/members";

const wixClient = createClient({
  modules: { posts, categories, members },
  auth: OAuthStrategy({
    clientId: process.env.WIX_CLIENT_ID!,
  }),
});

export default wixClient;
