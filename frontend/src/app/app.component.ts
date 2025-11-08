import { Component } from "@angular/core";
import { ScraperService } from "./services/scraper.service";
import { UrlInputComponent } from "./components/url-input/url-input.component";
import { KeywordInputComponent } from "./components/keyword-input/keyword-input.component";
import { LoaderComponent } from "./components/loader/loader.component";
import { SummaryDisplayComponent } from "./components/summary-display/summary-display.component";
import { DescriptionComponent } from "./components/description/description";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    UrlInputComponent,
    KeywordInputComponent,
    LoaderComponent,
    SummaryDisplayComponent,
    DescriptionComponent,
  ],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  urls: string[] = [];
  keyword: string = "";
  isLoading: boolean = false;
  summary: string = "";

  // Added missing properties
  projectTitle: string = "AI Multi-Website Summarizer";
  projectDescription: string = "This is a description of the project.";

  constructor(private scraperService: ScraperService) {}

  onUrlsChanged(urls: string[]) {
    this.urls = urls;
  }

  onKeywordChanged(keyword: string) {
    this.keyword = keyword;
  }

  summarize() {
    if (!this.urls.length || !this.keyword) {
      alert("Please enter URLs and a keyword!");
      return;
    }

    this.isLoading = true;

    this.scraperService.getSummary(this.urls, this.keyword).subscribe({
      next: (res) => {
        console.log("✅ Backend response:", res);
        this.summary = res.summary || "No summary received";
        this.isLoading = false;
      },
      error: (err) => {
        console.error("❌ Error getting summary:", err);
        alert("Failed to get summary");
        this.isLoading = false;
      },
    });
  }
}
