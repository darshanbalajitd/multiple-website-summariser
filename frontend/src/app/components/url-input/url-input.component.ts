import { Component,EventEmitter,Output } from "@angular/core";
import { FormArray,FormBuilder,FormGroup, Validators } from "@angular/forms";
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
    selector:'app-url-input',
      standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
    templateUrl:'./url-input.component.html',
    styleUrls:['./url-input.component.scss']
})
export class UrlInputComponent{
    @Output() urlsChanged=new EventEmitter<string[]>();

    urlForm: FormGroup;

    constructor(private fb: FormBuilder){
        this.urlForm=this.fb.group({
            urls:this.fb.array([this.createUrlControl()])
        });
        this.urlForm.valueChanges.subscribe(()=>{
            this.emitUrls();
        });
    }

    get urls(): FormArray{
        return this.urlForm.get('urls') as FormArray;
    }

    createUrlControl():FormGroup{
        return this.fb.group({
            url:['',[Validators.required,Validators.pattern('https?://.+')]]
        });
    }
    addUrl():void{
        if(this.urls.length<10){
            this.urls.push(this.createUrlControl());
        }
    }
    removeUrl(index:number):void{
        if (this.urls.length>1){
             this.urls.removeAt(index);
        }
    }
    emitUrls():void{
        const validUrls=this.urls.controls
        .map(control=>control.value.url)
        .filter(url=>url&&/^https?:\/\/.+/.test(url));
        this.urlsChanged.emit(validUrls);
    }
}