// musician-selector.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { RepertoireMarch } from 'src/app/models/repertoire/repertoire-march';

@Component({
  selector: 'app-march-selector',
  template: `
    <ion-list>
      <ion-item *ngFor="let march of marchs" (click)="selectMarch(march)" class="march-ion-item" lines="full">
        <ion-avatar slot="start">          
          <img *ngIf="march.type.image" [src]="'data:image/jpeg;base64,' + march.type.image " />
          <ion-img 
            *ngIf="march.type.image"
            [src]="'data:image/jpeg;base64,' + march.type.image ">
          </ion-img>   
          <ion-icon *ngIf="!march.type.image" name="musical-notes-outline"></ion-icon>           
        </ion-avatar>
        <ion-label class="initcap">
          {{ march.name | lowercase }} 
        </ion-label>
      </ion-item>
    </ion-list>
  `,
  styles: [`
    ion-item {
      cursor: pointer;
      min-height: 20px;
    }
    ion-label{
      margin-top:0px;
      margin-bottom:0px;
    }
    ion-avatar {
      width: 25px;
      height: 25px;
      margin-top: 2px;
      margin-bottom: 2px;
      margin-left:10px;
    }
    ion-icon {
      width: 25px;
      height: 25px;
    }
    .march-ion-item {    
      --min-height: 35px !important;       
      --inner-padding-end: 5px;
      //--padding-start:0px 
    }
    .initcap {
     text-transform: capitalize;
    }
  `]
})
export class MarchSelectorComponent {
  @Input() marchs: RepertoireMarch[] = [];
  @Output() marchSelected = new EventEmitter<RepertoireMarch>();

  constructor(private popoverController: PopoverController) {}

  selectMarch(march: RepertoireMarch) {         
    this.popoverController.dismiss(march); 
  }
}
