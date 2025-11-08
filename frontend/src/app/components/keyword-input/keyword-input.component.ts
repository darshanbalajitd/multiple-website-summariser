import { Component,EventEmitter,Output } from "@angular/core";
import { FormControl,Validators } from "@angular/forms";
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
    selector:'app-keyword-input',
      standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
    templateUrl:'./keyword-input.component.html',
    styleUrls:['./keyword-input.component.scss']
})

export class KeywordInputComponent{

    @Output() keywordChanged= new EventEmitter<string>();

    keywordControl=new FormControl('',Validators.required);

    constructor(){
        this.keywordControl.valueChanges.subscribe(value=>{
            if(this.keywordControl.valid ){
                this.keywordChanged.emit(value??'');
            }
        })
    }
}