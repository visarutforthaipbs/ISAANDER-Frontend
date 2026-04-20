const { BetaAnalyticsDataClient } = require("@google-analytics/data");
const fs = require("fs");

async function test() {
  const envContent = fs.readFileSync(".env.local", "utf8");
  const getEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1].replace(/"/g, '').trim() : null;
  };

  const propertyId = getEnv("GA4_PROPERTY_ID").replace("properties/", "");
  const clientEmail = getEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  let privateKey = getEnv("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");

  const client = new BetaAnalyticsDataClient({
    credentials: { client_email: clientEmail, private_key: privateKey },
  });

  try {
    console.log("Checking Metadata for Property:", propertyId);
    const [metadata] = await client.getMetadata({
      name: `properties/${propertyId}/metadata`,
    });

    console.log("\nAvailable Metrics (Searching for AdSense ones):");
    const adsenseMetrics = metadata.metrics.filter(m => m.apiName.toLowerCase().includes("adsense") || m.apiName.toLowerCase().includes("publisher"));
    adsenseMetrics.forEach(m => console.log(`- ${m.apiName} (${m.uiName})`));

    console.log("\nAttempting basic report with just screenPageViews...");
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      limit: 5,
    });

    console.log("\nBasic Report Result:");
    response.rows.forEach(row => console.log(`${row.dimensionValues[0].value}: ${row.metricValues[0].value} views`));

  } catch (err) {
    console.error("API Error:", err.message);
    if (err.details) console.error("Details:", err.details);
  }
}

test();
