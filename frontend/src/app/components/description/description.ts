import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

@Component({
  selector: "app-description",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./description.component.html",
  styleUrls: ["./description.component.scss"],
})
export class DescriptionComponent {
  @Input() title: string = "";
  @Input() imageUrl: string = "";
  @Input() set description(value: string) {
    this._descriptionSafe = this.sanitizer.bypassSecurityTrustHtml(value);
  }

  _descriptionSafe: SafeHtml | null = null;

  constructor(private sanitizer: DomSanitizer) {}
}
