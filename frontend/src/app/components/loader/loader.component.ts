import { Component, Input } from "@angular/core";
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
    selector:'app-loader',
      standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
    templateUrl:'./loader.component.html',
    styleUrls:['./loader.component.scss'],
    host: {
      '[style.--loader-size]': 'size + "px"',
      '[style.--dot-size]': 'dotSize + "px"',
      '[style.--loader-color]': 'color'
    }
})
export class LoaderComponent{
  @Input() isLoading: boolean = false;
  // Controls to ensure the loader stays modest in size
  @Input() size: number = 50; // container size in px
  @Input() dotSize: number = 14; // dot size in px
  @Input() color: string = '#1D4ED8'; // default blue
}