import { getPageViews } from "./src/lib/analytics";
import * as dotenv from "dotenv";
import path from "path";

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function test() {
  console.log("Testing GA4 Data Fetch...");
  console.log("Property ID:", process.env.GA4_PROPERTY_ID);
  
  // Test with some common paths or broad prefixes
  const paths = ["/post/"]; 
  const result = await getPageViews(paths, 30);
  
  console.log("\n--- Results for last 30 days ---");
  console.log("Total Views:", result.totalViews);
  console.log("Total Revenue:", result.totalRevenue);
  console.log("Total Impressions:", result.totalImpressions);
  
  if (result.pages.length > 0) {
    console.log("\nTop Pages:");
    result.pages.slice(0, 5).forEach(p => {
      console.log(`- ${p.path}: ${p.views} views, ฿${p.revenue} revenue`);
    });
  } else {
    console.log("\nNo data found for the given paths.");
  }

  if (result.totalRevenue === 0 && result.totalViews > 0) {
    console.log("\n[!] Heads up: Views were found but Revenue is 0. This usually means:");
    console.log("1. AdSense is not yet linked to this GA4 property.");
    console.log("2. The link was just created and data hasn't synced (takes 24-48h).");
    console.log("3. There were no ad impressions on these specific pages in this period.");
  }
}

test().catch(console.error);
