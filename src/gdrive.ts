import { Browser, BrowserContext, chromium, Page } from "playwright";

export type GDriveAvailability = {
  exists: boolean;
  preview: boolean;
};
type Props = {
  context?: BrowserContext;
};
export async function checkGDriveAvailability(
  id: string,
  config?: Props,
): Promise<GDriveAvailability> {
  let context: BrowserContext;
  let browser: Browser | undefined;

  if (config?.context)
    // eslint-disable-next-line prefer-destructuring
    context = config.context;
  else {
    browser = await chromium.launch();

    context = await browser.newContext();
  }

  const page = await context.newPage();

  let exists: boolean | undefined;
  let preview: boolean | undefined;

  try {
    const thumbnailOk = await checkThumbnail(id, page);

    if (thumbnailOk) {
      exists = true;
      preview = true;
    }

    if (exists === null)
      exists = await checkVideoPage(id, page);

    if (exists === true && preview === null) {
        // Try to detect the video element to determine if preview is available.
        try {

          const driveImg = page.locator("img[src*='drive-viewer']");

          await page.waitForLoadState("load");
          // Espera a que esté visible
          await driveImg.waitFor( {
            timeout: 500,
          } );
          preview = true;
        } catch {
          preview = false;
        }
    }
  } finally {
    page.close();
    if (browser)
      await browser.close();
  }

  return {
    exists: !!exists,
    preview: !!preview,
  };
}


async function checkThumbnail(id: string, page: Page) {
  const thumbnailUrl = `https://lh3.googleusercontent.com/d/${id}=w320`;
  const thumbnailResponse = await page.goto(thumbnailUrl, {
    waitUntil: "domcontentloaded",
  } );

  if (!thumbnailResponse || thumbnailResponse.status() >= 400)
    return false;

  return true;
}

async function checkVideoPage(id: string, page: Page) {
  const url = `https://drive.google.com/file/d/${id}/preview`;
  const response = await page.goto(url, {
    waitUntil: "domcontentloaded",
  } );

  let content = await page.content();

  if (!response || response.status() >= 400)
    return false;
  else {
    // Check for common error messages in the page content.

    if (content.includes("File not found") || content.includes("No se pudo encontrar el archivo"))
      return false;
  }

  return true;
}