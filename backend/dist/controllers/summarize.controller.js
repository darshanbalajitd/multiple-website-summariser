"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeController = void 0;
const summarizer_service_1 = require("../services/summarizer.service");
const scraper_service_1 = require("../services/scraper.service");
const htmlCleaner_1 = require("../utils/htmlCleaner");
const summarizeController = async (req, res) => {
    try {
        // Log incoming request with details for easier debugging
        console.log("📩 Received request from frontend:");
        console.log("  Time:", new Date().toISOString());
        console.log("  IP:", req.ip || req.connection?.remoteAddress);
        console.log("  Origin header:", req.get('origin'));
        console.log("  Headers:", {
            'content-type': req.get('content-type'),
            'user-agent': req.get('user-agent'),
        });
        console.log("  Body:", req.body);
        const { urls, keyword } = req.body;
        // Validate input
        if (!urls?.length || !keyword) {
            return res.status(400).json({
                error: "Please provide a non-empty 'urls' array and a 'keyword' string",
            });
        }
        // 1) Scrape the provided URLs
        const scraped = await (0, scraper_service_1.scrapeContent)(urls);
        // 2) Clean HTML -> plain text
        const cleaned = scraped.map(s => ({ url: s.url, content: (0, htmlCleaner_1.cleanHTML)(s.content) }));
        /* Save cleaned HTML files for testing purposes
        try {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const saveDir = path.join(process.cwd(), 'scraped_data', timestamp);
          
          // Create directory if it doesn't exist
          if (!fs.existsSync(saveDir)) {
            fs.mkdirSync(saveDir, { recursive: true });
          }
          
          // Save each cleaned HTML file
          for (let i = 0; i < cleaned.length; i++) {
            const urlObj = new URL(cleaned[i].url);
            const hostname = urlObj.hostname.replace(/[^a-z0-9]/gi, '_');
            const filename = `${hostname}_${i}.txt`;
            const filePath = path.join(saveDir, filename);
            
            
            console.log(`✅ Saved cleaned HTML to ${filePath}`);
          }
        } catch (error) {
          console.error('❌ Error saving cleaned HTML files:', error);
        }*/
        // 3) Get summary from service (returns a string)
        const summary = await (0, summarizer_service_1.summarizeContent)(cleaned, keyword);
        // Return explicit typed response
        const responseBody = { summary };
        return res.status(200).json(responseBody);
    }
    catch (error) {
        console.error("❌ Error processing request:", error);
        return res.status(500).json({
            error: "Failed to generate summary",
        });
    }
};
exports.summarizeController = summarizeController;
