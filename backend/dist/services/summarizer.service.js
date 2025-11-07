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
exports.summarizeContent = void 0;
const axios_1 = __importStar(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
// Ensure environment variables are loaded
dotenv_1.default.config();
// Support both spellings in env vars
const API_URL = process.env.SUMMARISER_API_URL || 'https://api.hyperbolic.xyz/v1/chat/completions';
const API_KEY = process.env.SUMMARISER_API_KEY;
// Debug: log whether the key is present at module load time (will appear in server logs)
console.log('env check at module load - SUMMARISER_API_KEY set?:', Boolean(process.env.SUMMARISER_API_KEY));
/**
 * Generate a fallback summary when the API is unavailable
 */
const generateFallbackSummary = (documents, keyword) => {
    const sources = documents.map(doc => doc.url);
    const wordCount = documents.reduce((sum, doc) => sum + doc.content.split(/\s+/).length, 0);
    return `Analyzed ${wordCount} words from ${sources.length} source(s) about "${keyword}". 
Key sources: ${sources.join(", ")}. 
(Note: This is a fallback summary, API was unavailable)`;
};
/**
 * Attempt to summarize content using the API, fall back to simple summary if needed
 */
const summarizeContent = async (documents, keyword) => {
    // Input validation
    if (!documents?.length) {
        throw new Error('No documents provided for summarization');
    }
    if (!keyword?.trim()) {
        throw new Error('No keyword provided for summarization');
    }
    console.log(`🔍 Summarizing ${documents.length} documents about "${keyword}"...`);
    // Check API configuration
    if (!API_KEY) {
        console.warn('⚠️ No API key found in environment (checked SUMMARISER_API_KEY and SUMMARIZER_API_KEY)');
        return generateFallbackSummary(documents, keyword);
    }
    // Combine documents with source attribution
    const combinedText = documents
        .map((doc) => `${doc.content}\n(Source: ${doc.url})`)
        .join("\n\n");
    try {
        console.log('📤 Sending request to summarizer API...');
        // Implement retry logic with exponential backoff
        const maxRetries = 3;
        let retries = 0;
        let lastError;
        let resp;
        while (retries < maxRetries) {
            try {
                console.log(`API request attempt ${retries + 1}/${maxRetries}...`);
                resp = await axios_1.default.post(API_URL, {
                    model: 'meta-llama/Meta-Llama-3-70B-Instruct',
                    messages: [
                        {
                            role: "system",
                            content: `
You are an advanced summarization assistant that outputs results in **pure HTML** format only.

Your ONLY task:
- Read the provided content.
- Extract the most important factual points directly related to the given <b>keyword</b>.
- Summarize them as an HTML <ol> list (5–10 points).
- Make sure to include points from different sources (urls) provided not just a single one.

Strict Output Rules:
- Respond ONLY with valid HTML — no markdown, JSON, or escaped characters.
- Wrap all key terms (especially the <b>keyword</b>) in <b> tags.
- Each point must be a single <li> element.
- End each point with a styled source citation(if present) using the following HTML snippet:
<span class="source-box"><a href="https://example.com/eu-ai-law" target="_blank">source</a></span>

- Replace the word "source" with the domain name (e.g., youtube.com) and set the outermost <span> to be a clickable link using <a href="URL" target="_blanki> elements within a single <ol> ... </ol> block.
- Do NOT include any text before or after the <ol> block.
- Do NOT include explanations, reasoning, or meta comments.
- Do NOT merge facts from multiple sources into one point.
- Give points from ALL provided URLs, do not skip any under the condition that the URL has content related to "${keyword}".
- Each <li> must be ≤ 40 words and fully self-contained.
- No duplicate or vague points. No filler content.
- Maximum of 10 points. Minimum of 5.
- Make sure summary has content from each and every url and no url is skipped.
`
                        },
                        {
                            role: "user",
                            content: `
Summarize the following content about "<b>${keyword}</b>" into HTML format:

${combinedText}

Follow the format and rules strictly.
`
                        }
                    ],
                    max_tokens: 800,
                    temperature: 0.7,
                    top_p: 0.8,
                    stream: false,
                }, {
                    headers: {
                        Authorization: `Bearer ${API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    // Increased timeout to reduce ECONNRESET errors
                    timeout: 120000,
                });
                // If successful, break out of the retry loop
                break;
            }
            catch (error) {
                const err = error;
                lastError = err;
                if (err.code === 'ECONNRESET' || (err.code && err.code.includes('ETIMEDOUT'))) {
                    retries++;
                    if (retries < maxRetries) {
                        const delay = Math.pow(2, retries) * 1000; // Exponential backoff: 2s, 4s, 8s
                        console.log(`Connection error (${err.code}). Retrying in ${delay / 1000}s...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                }
                else {
                    // For other errors, don't retry
                    break;
                }
            }
        }
        // If we exhausted all retries and still have an error
        if (retries === maxRetries && lastError) {
            throw lastError;
        }
        const output = resp?.data?.choices?.[0]?.message?.content;
        if (!output) {
            console.warn('⚠️ API returned empty response, using fallback');
            return generateFallbackSummary(documents, keyword);
        }
        console.log('✅ Successfully generated summary');
        return output;
    }
    catch (error) {
        // Handle specific API errors
        if (error instanceof axios_1.AxiosError) {
            // Network errors like ECONNRESET won't have response data
            if (error.code === 'ECONNRESET') {
                console.error('❌ API Error: Connection reset by server (ECONNRESET). This may be due to network issues or server timeout.');
                console.error('   Try increasing the timeout or check network connectivity.');
            }
            else if (!error.response) {
                console.error('❌ API Error: Network error -', error.message);
            }
            else {
                console.error('❌ API Error:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message
                });
                // Check for specific error types
                if (error.response?.status === 401) {
                    console.error('❌ API key invalid or unauthorized');
                }
                else if (error.response?.status === 429) {
                    console.error('❌ Rate limit exceeded');
                }
            }
        }
        else {
            console.error('❌ Unexpected error:', error);
        }
        // Fall back to simple summary instead of throwing
        console.warn('⚠️ Using fallback summarizer due to API error');
        return generateFallbackSummary(documents, keyword);
    }
};
exports.summarizeContent = summarizeContent;
