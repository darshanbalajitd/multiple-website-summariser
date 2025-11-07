import * as os from "os";
import puppeteer from "puppeteer";
import { ScrapedContent } from "../types";

/**
 * Recursively traverse shadow roots up to 4 levels deep to find main or body content.
 */
const traverseShadowRoots = async (element: Element, depth: number = 0): Promise<string | null> => {
  if (depth > 4) return null; // Limit traversal depth to 4 levels

  const shadowRoot = element.shadowRoot;
  if (shadowRoot) {
    const mainOrBody = shadowRoot.querySelector("main, body");
    if (mainOrBody) {
      return mainOrBody.textContent?.trim() || null;
    }

    // Traverse deeper into nested shadow roots
    for (const child of shadowRoot.children) {
      const content = await traverseShadowRoots(child as Element, depth + 1);
      if (content) return content;
    }
  }

  return null;
};

export const scrapeContent = async (
  urls: string[],
  concurrency: number = Math.min(os.cpus().length, 4)
): Promise<ScrapedContent[]> => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const results: ScrapedContent[] = [];
  const queue = urls.slice();

  const worker = async () => {
    while (queue.length) {
      const url = queue.shift();
      if (!url) break;
      const page = await browser.newPage();
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 10000 });

        // Attempt to scrape main or body content
        const content = await page.evaluate(async () => {
          const mainOrBody = document.querySelector("main, body");
          if (mainOrBody) {
            return mainOrBody.textContent?.trim() || "";
          }

          // Traverse shadow roots if main or body is not found
          for (const element of document.querySelectorAll("*")) {
            const shadowContent = await traverseShadowRoots(element);
            if (shadowContent) return shadowContent;
          }

          return ""; // Fallback if no content is found
        });

        results.push({ url, content });
      } catch (e) {
        console.error(`❌ Failed to scrape ${url}`, e);
        results.push({ url, content: "" });
      } finally {
        await page.close();
      }
    }
  };

  await Promise.all(Array(concurrency).fill(0).map(worker));
  await browser.close();
  return results;
};
