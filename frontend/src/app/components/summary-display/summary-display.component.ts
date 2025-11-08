import { Component,Input, ViewEncapsulation} from "@angular/core";
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
@Component({
    selector:'app-summary-display',  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
    templateUrl:'./summary-display.component.html',
    styleUrls:['./summary-display.component.scss'],
    encapsulation: ViewEncapsulation.None 
})
export class SummaryDisplayComponent{
    @Input()  summary:string='';

    constructor(private sanitizer: DomSanitizer) {}

  sanitizeHTML(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}