import crypto from "crypto";
import fs from "fs";
import puppeteer, { Device } from "puppeteer";

import { logger } from "@website-tools/common";

type DeviceType = "mobile" | "desktop";

const desktopDevice: Device = {
  name: "desktop",
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36",
  viewport: {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    isLandscape: false,
  },
};

const getScreenshotPath = (url: string) => {
  const hash = crypto.createHash("md5").update(url).digest("hex");

  return `screenshots/${hash}.png`;
};

const createScreenshotDir = () => {
  if (!fs.existsSync("screenshots")) {
    logger.info(`Creating screenshot folder`);

    fs.mkdirSync("screenshots");
  }
};

export const screenshot = async (
  url: string,
  deviceType: DeviceType = "desktop"
) => {
  logger.info({ url, deviceType }, `Taking screenshot`);

  createScreenshotDir();

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setJavaScriptEnabled(false);
  await page.goto(url, { waitUntil: "networkidle0" });

  let device = desktopDevice;

  if (deviceType === "mobile") {
    device = puppeteer.devices["iPhone XR"];
  }

  page.emulate(device);

  const screenshotPath = getScreenshotPath(url);

  logger.info({ url, deviceType, screenshotPath }, `Writing screenshot`);

  await page.screenshot({
    quality: 75,
    type: "jpeg",
    path: screenshotPath,
  });

  return { deviceType, screenshotPath };
};

export const screenshots = async <T extends DeviceType>(
  url: string,
  deviceTypes: T[]
): Promise<Record<T, { screenshotPath: string }>> => {
  logger.info({ url, deviceTypes }, `Taking screenshots`);

  createScreenshotDir();

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setJavaScriptEnabled(false);
  await page.goto(url, { waitUntil: "networkidle0" });

  const screenshots = await Promise.all(
    deviceTypes.map(async (deviceType) => {
      let device = desktopDevice;

      if (deviceType === "mobile") {
        device = puppeteer.devices["iPhone XR"];
      }

      page.emulate(device);

      const screenshotPath = getScreenshotPath(`${url}-${device.name}`);

      logger.info({ url, deviceType, screenshotPath }, `Writing screenshot`);

      await page.screenshot({
        quality: 75,
        type: "jpeg",
        path: screenshotPath,
      });

      return { deviceType, screenshotPath };
    })
  );

  return screenshots.reduce((acc, { deviceType, screenshotPath }) => {
    acc[deviceType] = { screenshotPath };

    return acc;
  }, {} as Record<T, { screenshotPath: string }>);
};
