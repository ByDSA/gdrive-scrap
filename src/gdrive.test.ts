import { chromium, Browser, BrowserContext } from "playwright";
import { checkGDriveAvailability } from "./gdrive";

describe("checkGDriveAvailability integration test", () => {
  let browser: Browser;
  let context: BrowserContext;

  beforeAll(async () => {
    browser = await chromium.launch();
    context = await browser.newContext();
  } );

  afterAll(async () => {
    await browser.close();
  } );

  it("should return a valid result for a given Google Drive id", async () => {
    const videoId = "1UpsYH1k5qFsXC98pyCx2utulRq2jtJmG";
    const result = await checkGDriveAvailability(videoId, {
      context,
    } );

    expect(result.exists).toBe(true);
    expect(result.preview).toBe(true);
  } );

  it("should return exists=false", async () => {
    const videoId = "invalid-id";
    const result = await checkGDriveAvailability(videoId, {
      context,
    } );

    expect(result.exists).toBe(false);
    expect(result.preview).toBe(false);
  } );
} );
