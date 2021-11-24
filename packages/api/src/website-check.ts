import Queue from "bee-queue";
import axios from "axios";
import psi from "psi";

import { AllChecks, checkAll as checkAllSEO } from "@website-tools/seo";
import { logger } from "@website-tools/common";
import { screenshot, screenshots } from "./screenshot";

export const queue = new Queue("websiteCheck");

const fetchFavicon = async (
  icons: { href: string; sizes: string }[]
): Promise<string | null> => {
  const { href } = icons.find((icon) => icon.sizes === "32x32") || icons[0];

  const res = await axios.get(href, { responseType: "arraybuffer" });

  if (res.status !== 200) {
    return null;
  }

  return Buffer.from(res.data).toString("base64");
};

const getPsi = async (
  url: string,
  strategy: "mobile" | "desktop" | "both" = "both"
) => {
  const reports: { mobile?: any; desktop?: any } = {};

  if (strategy === "mobile" || strategy === "both") {
    logger.info("Getting Page Speed Insight report", { url, strategy });

    reports.mobile = await psi(url, { strategy: "mobile", locale: "de_DE" });
  }

  if (strategy === "desktop" || strategy === "both") {
    logger.info("Getting Page Speed Insight report", { url, strategy });

    reports.mobile = await psi(url, { strategy: "desktop", locale: "de_DE" });
  }

  return reports;
};

export interface CheckWebsiteResult extends AllChecks {
  favicon?: string;
  psi?: {
    desktop?: any;
    mobile?: any;
  };
  screenshots?: {
    desktop?: string;
    mobile?: string;
  };
}

export const checkWebsite = async (
  url: string
): Promise<CheckWebsiteResult> => {
  const seoCheck = await checkAllSEO(url);

  const result: CheckWebsiteResult = { ...seoCheck };

  let favicon: string | null = null;
  if (seoCheck.results.favicon.info[0].status === "ok") {
    favicon = await fetchFavicon(seoCheck.results.favicon.info[0].actual.icons);

    if (favicon) {
      result.favicon = favicon;
    }
  }

  // TODO desktop PSI
  result.psi = await getPsi(url, "mobile");

  const { mobile: mobileShot, desktop: desktopShot } = await screenshots(url, [
    "mobile",
    "desktop",
  ]);

  result.screenshots = {
    desktop: desktopShot.screenshotPath,
    mobile: mobileShot.screenshotPath,
  };

  return result;
};

queue.process(async (job) => {
  try {
    logger.info({ id: job.id }, "Processing job");

    const report = await checkWebsite(job.data.url);

    logger.info({ id: job.id }, "Finished processing job");

    return report;
  } catch (err) {
    logger.error({ id: job.id, err: err.message }, "Error processing job");

    throw err;
  }
});
