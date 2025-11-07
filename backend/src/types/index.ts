export interface SummarizeRequestBody{
    urls: string[];
    keyword: string;
}

export interface ScrapedContent{
    url:string;
    content:string;
}

export interface SummaryResponse{
    // Single summary string returned to the frontend
    summary: string;
}