"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeContent = void 0;
const os = __importStar(require("os"));
const puppeteer_1 = __importDefault(require("puppeteer"));
/**
 * Recursively traverse shadow roots up to 4 levels deep to find main or body content.
 */
const traverseShadowRoots = async (element, depth = 0) => {
    if (depth > 4)
        return null; // Limit traversal depth to 4 levels
    const shadowRoot = element.shadowRoot;
    if (shadowRoot) {
        const mainOrBody = shadowRoot.querySelector("main, body");
        if (mainOrBody) {
            return mainOrBody.textContent?.trim() || null;
        }
        // Traverse deeper into nested shadow roots
        for (const child of shadowRoot.children) {
            const content = await traverseShadowRoots(child, depth + 1);
            if (content)
                return content;
        }
    }
    return null;
};
const scrapeContent = async (urls, concurrency = Math.min(os.cpus().length, 4)) => {
    const browser = await puppeteer_1.default.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const results = [];
    const queue = urls.slice();
    const worker = async () => {
        while (queue.length) {
            const url = queue.shift();
            if (!url)
                break;
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
                        if (shadowContent)
                            return shadowContent;
                    }
                    return ""; // Fallback if no content is found
                });
                results.push({ url, content });
            }
            catch (e) {
                console.error(`❌ Failed to scrape ${url}`, e);
                results.push({ url, content: "" });
            }
            finally {
                await page.close();
            }
        }
    };
    await Promise.all(Array(concurrency).fill(0).map(worker));
    await browser.close();
    return results;
};
exports.scrapeContent = scrapeContent;
