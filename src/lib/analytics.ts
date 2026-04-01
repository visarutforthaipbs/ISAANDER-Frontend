import { BetaAnalyticsDataClient } from "@google-analytics/data";

const PROPERTY_ID = process.env.GA4_PROPERTY_ID;

function getAnalyticsClient() {
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!credentialsJson) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS_JSON env var is not set");
  }
  const credentials = JSON.parse(credentialsJson);
  return new BetaAnalyticsDataClient({ credentials });
}

export interface PageViewData {
  path: string;
  pageTitle: string;
  views: number;
}

export interface AuthorAnalytics {
  totalViews: number;
  pages: PageViewData[];
  periodLabel: string;
}

/**
 * Fetch pageview data from GA4 for pages matching given path prefixes.
 * @param pathPrefixes - e.g. ["/post/my-slug", "/post/another-slug"]
 * @param days - lookback period in days (default 30)
 */
export async function getPageViews(
  pathPrefixes: string[],
  days: number = 30
): Promise<AuthorAnalytics> {
  if (!PROPERTY_ID) {
    return { totalViews: 0, pages: [], periodLabel: `${days} วัน` };
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
      metrics: [{ name: "screenPageViews" }],
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

    const pages: PageViewData[] = (response.rows ?? []).map((row) => ({
      path: row.dimensionValues?.[0]?.value ?? "",
      pageTitle: row.dimensionValues?.[1]?.value ?? "",
      views: parseInt(row.metricValues?.[0]?.value ?? "0", 10),
    }));

    const totalViews = pages.reduce((sum, p) => sum + p.views, 0);

    return {
      totalViews,
      pages,
      periodLabel: `${days} วัน`,
    };
  } catch (error) {
    console.error("GA4 API error:", error);
    return { totalViews: 0, pages: [], periodLabel: `${days} วัน` };
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
