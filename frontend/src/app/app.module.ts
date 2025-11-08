import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";

import { UrlInputComponent } from "./components/url-input/url-input.component";
import { KeywordInputComponent } from "./components/keyword-input/keyword-input.component";
import { SummaryDisplayComponent } from "./components/summary-display/summary-display.component";
import { LoaderComponent } from "./components/loader/loader.component";


@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,    
    UrlInputComponent,
    KeywordInputComponent,
    SummaryDisplayComponent,
    LoaderComponent
  ],
  providers: []
})
export class AppModule { }
