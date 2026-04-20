const { BetaAnalyticsDataClient } = require("@google-analytics/data");
const fs = require("fs");
const path = require("path");

async function test() {
  const envContent = fs.readFileSync(".env.local", "utf8");
  const getEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1].replace(/"/g, '').trim() : null;
  };

  const propertyId = getEnv("GA4_PROPERTY_ID").replace("properties/", "");
  const clientEmail = getEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  let privateKey = getEnv("GOOGLE_PRIVATE_KEY");
  
  // Handle the newline escaping in the private key
  privateKey = privateKey.replace(/\\n/g, "\n");

  console.log("Property:", propertyId);
  console.log("Email:", clientEmail);

  const client = new BetaAnalyticsDataClient({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
  });

  try {
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      dimensions: [{ name: "pagePath" }],
      metrics: [
        { name: "screenPageViews" },
        { name: "publisherAdRevenue" },
        { name: "publisherAdImpressions" }
      ],
      limit: 10,
    });

    console.log("\n--- GA4 Data Check ---");
    if (!response.rows || response.rows.length === 0) {
      console.log("No data rows found.");
    } else {
      response.rows.forEach(row => {
        console.log(`${row.dimensionValues[0].value}: ${row.metricValues[0].value} views, ฿${row.metricValues[1].value} rev`);
      });
      
      const totalRev = response.rows.reduce((sum, r) => sum + parseFloat(r.metricValues[1].value), 0);
      console.log("\nTotal Revenue found in this sample:", totalRev);
      
      if (totalRev > 0) {
        console.log(">>> SUCCESS: Real data is active.");
      } else {
        console.log(">>> DATA LINKED BUT NO REVENUE YET: Views are coming through, but AdSense revenue is 0.00.");
      }
    }
  } catch (err) {
    console.error("API Error:", err.message);
  }
}

test();
