# Multiple Website Summariser

Description
-----------
A small web application that accepts 1–10 website URLs and a required keyword, scrapes the pages, cleans the raw HTML into plain text, and returns a concise summary focused on the provided keyword. The backend performs parallel scraping and uses a summarization API (or a fallback summarizer) to generate an HTML-formatted summary. The frontend collects URLs and the keyword and displays the returned summary.

## Demo

![Demo](https://github-production-user-asset-6210df.s3.amazonaws.com/209789676/511317795-fd01bb44-a099-46ea-85de-13b5674f4e51.gif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20251107%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251107T123321Z&X-Amz-Expires=300&X-Amz-Signature=c2b9a916f58ab881edc5c79387ce3720c2934362f1947240ad9a825616b55ef5&X-Amz-SignedHeaders=host)


What is used
------------
- Backend: Node.js + Express. See the server entry at [backend/src/server.ts](backend/src/server.ts) and app configuration at [backend/src/app.ts](backend/src/app.ts).
- Scraping: Puppeteer implemented in [`scrapeContent`](backend/src/services/scraper.service.ts).
- HTML cleaning: [`cleanHTML`](backend/src/utils/htmlCleaner.ts).
- Summarization: API integration and fallback logic in [`summarizeContent`](backend/src/services/summarizer.service.ts). API key is configured via [backend/.env](backend/.env).
- Controller and route: request handling implemented in [`summarizeController`](backend/src/controllers/summarize.controller.ts) and the route at [backend/src/routes/summarize.route.ts](backend/src/routes/summarize.route.ts).
- Frontend: Angular (standalone components). Main app logic is in [frontend/src/app/app.component.ts](frontend/src/app/app.component.ts) and the frontend call to backend is in [`ScraperService.getSummary`](frontend/src/app/services/scraper.service.ts).

Notes and configuration
-----------------------
- Parallel scraping and CPU/ram:
  - Each URL scraping runs in a separate browser page/process. The scraper defaults concurrency based on available CPU cores (see [`scrapeContent`](backend/src/services/scraper.service.ts)).
  - Adjust the maximum number of concurrent scrapers according to your machine: fewer concurrent pages on low-CPU or low-RAM systems to avoid crashes or extreme swapping.
  - If you expect to run on a low-resource machine, reduce concurrency to 1–2 and increase timeouts accordingly.
- API / model / request configuration:
  - Update the API endpoint and model in [`summarizeContent`](backend/src/services/summarizer.service.ts) before production use.
  - Set your API key in [backend/.env](backend/.env) (SUMMARISER_API_KEY).
  - Adjust request timeouts, retry/backoff, and model parameters in [`summarizeContent`](backend/src/services/summarizer.service.ts) to fit your API quotas and latency tolerance.
- CORS / origin: configure CORS in [backend/src/app.ts](backend/src/app.ts) if serving the frontend from a different origin.

Quickstart
----------
1. Backend
   - Install dependencies and start development server:
     ```sh
     cd backend
     npm install
     npm run dev
     ```
   - Production build and run:
     ```sh
     cd backend
     npm install
     npm run build
     npm start
     ```
   - Ensure [backend/.env](backend/.env) is set with your summarization API key and any other env vars.

2. Frontend
   - Install and run:
     ```sh
     cd frontend
     npm install
     npm run start
     ```
   - Open http://localhost:4200 and use the UI to paste URLs and a keyword.

3. End-to-end
   - Enter 1–10 URLs in the frontend, provide a keyword, then click "Summarize". The frontend calls [`ScraperService.getSummary`](frontend/src/app/services/scraper.service.ts) which posts to the backend route mounted at `/api/summarize` handled by [`summarizeController`](backend/src/controllers/summarize.controller.ts).

Conclusion
----------
This project demonstrates a simple pipeline for multi-site scraping and keyword-focused summarization. Before production, verify scraping concurrency limits for your infrastructure, configure the summarization API/model and key in [`summarizeContent`](backend/src/services/summarizer.service.ts) and [backend/.env](backend/.env), and review CORS and security settings in [backend/src/app.ts](backend/src/app.ts).
