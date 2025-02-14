import { Browser, BrowserContext, chromium } from "playwright";

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
  const url = `https://drive.google.com/file/d/${id}/preview`;
  let exists = true;
  let preview = false;

  try {
    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
    } );

    if (!response || response.status() >= 400)
      exists = false;
    else {
      // Check for common error messages in the page content.
      const content = await page.content();

      if (content.includes("File not found") || content.includes("No se pudo encontrar el archivo"))
        exists = false;
    }

    if (exists) {
      // Try to detect the video element to determine if preview is available.
      try {
        const driveImg = page.locator("img[src*='drive-viewer']");

        await page.waitForLoadState("load");
        // Espera a que esté visible
        await driveImg.waitFor( {
          state: "visible",
          timeout: 1000,
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
    exists,
    preview,
  };
}
