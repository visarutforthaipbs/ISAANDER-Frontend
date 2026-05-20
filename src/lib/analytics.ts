import { BetaAnalyticsDataClient } from "@google-analytics/data";

const RAW_PROPERTY_ID = process.env.GA4_PROPERTY_ID;
const PROPERTY_ID = RAW_PROPERTY_ID?.startsWith("properties/")
  ? RAW_PROPERTY_ID.replace("properties/", "")
  : RAW_PROPERTY_ID;

function getAnalyticsClient() {
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let rawKey = process.env.GOOGLE_PRIVATE_KEY;
  if (rawKey && rawKey.startsWith('"') && rawKey.endsWith('"')) {
    rawKey = rawKey.substring(1, rawKey.length - 1);
  }
  const privateKey = rawKey?.replace(/\\n/g, "\n");

  const credentials = credentialsJson
    ? JSON.parse(credentialsJson)
    : serviceAccountEmail && privateKey
      ? { client_email: serviceAccountEmail, private_key: privateKey }
      : null;

  if (!credentials) {
    throw new Error(
      "GA4 credentials are missing. Set GOOGLE_APPLICATION_CREDENTIALS_JSON or GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY"
    );
  }

  return new BetaAnalyticsDataClient({ credentials });
}

export interface PageViewData {
  path: string;
  pageTitle: string;
  views: number;
  revenue: number;
  impressions: number;
}

export interface AuthorAnalytics {
  totalViews: number;
  totalRevenue: number;
  totalImpressions: number;
  pages: PageViewData[];
  periodLabel: string;
}

/**
 * Fetch pageview and revenue data from GA4 for pages matching given path prefixes.
 * @param pathPrefixes - e.g. ["/post/my-slug", "/post/another-slug"]
 * @param days - lookback period in days (default 30)
 */
export async function getPageViews(
  pathPrefixes: string[],
  days: number = 30
): Promise<AuthorAnalytics> {
  if (!PROPERTY_ID) {
    return { totalViews: 0, totalRevenue: 0, totalImpressions: 0, pages: [], periodLabel: `${days} วัน` };
  }

  try {
    const client = getAnalyticsClient();

    const [response] = await client.runReport({
      property: `properties/${PROPERTY_ID}`,
      dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
      dimensions: [
        { name: "pagePath" },
        { name: "pageTitle" },
      ],
      metrics: [
        { name: "screenPageViews" },
        { name: "totalAdRevenue" },
        { name: "publisherAdImpressions" },
      ],
      dimensionFilter: {
        orGroup: {
          expressions: pathPrefixes.map((prefix) => ({
            filter: {
              fieldName: "pagePath",
              stringFilter: {
                matchType: "BEGINS_WITH" as const,
                value: prefix,
              },
            },
          })),
        },
      },
      orderBys: [
        {
          metric: { metricName: "screenPageViews" },
          desc: true,
        },
      ],
      limit: 100,
    });

    const aggregatedPages = new Map<string, PageViewData>();

    for (const row of response.rows ?? []) {
      const fullPath = row.dimensionValues?.[0]?.value ?? "";
      // Normalize path by removing query parameters
      const path = fullPath.split("?")[0];
      const pageTitle = row.dimensionValues?.[1]?.value ?? "";
      const views = parseInt(row.metricValues?.[0]?.value ?? "0", 10);
      const revenue = parseFloat(row.metricValues?.[1]?.value ?? "0");
      const impressions = parseInt(row.metricValues?.[2]?.value ?? "0", 10);

      const existing = aggregatedPages.get(path);
      if (existing) {
        existing.views += views;
        existing.revenue += revenue;
        existing.impressions += impressions;
        // Keep the first title or could try to find the "best" one
      } else {
        aggregatedPages.set(path, {
          path,
          pageTitle,
          views,
          revenue,
          impressions,
        });
      }
    }

    const pages = Array.from(aggregatedPages.values()).sort(
      (a, b) => b.views - a.views
    );

    const totalViews = pages.reduce((sum, p) => sum + p.views, 0);
    const totalRevenue = pages.reduce((sum, p) => sum + p.revenue, 0);
    const totalImpressions = pages.reduce((sum, p) => sum + p.impressions, 0);

    return {
      totalViews,
      totalRevenue,
      totalImpressions,
      pages,
      periodLabel: `${days} วัน`,
    };
  } catch (error) {
    console.error("GA4 API error:", error);
    return { totalViews: 0, totalRevenue: 0, totalImpressions: 0, pages: [], periodLabel: `${days} วัน` };
  }
}

/**
 * Estimate AdSense revenue based on pageviews.
 * Uses a configurable RPM (Revenue Per Mille / 1000 impressions).
 */
export function estimateRevenue(
  pageviews: number,
  rpmThb: number = 30 // default RPM in THB; adjust based on actual AdSense data
): number {
  return (pageviews / 1000) * rpmThb;
}
