// musician-selector.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Musician } from 'src/app/models/musician/musician';

@Component({
  selector: 'app-musician-selector',
  template: `
    <ion-list>
      <ion-item *ngFor="let musician of musicians" (click)="selectMusician(musician)" class="musician-ion-item" lines="full">
        <ion-avatar slot="start">          
          <img *ngIf="musician.image" [src]="'data:image/jpeg;base64,' + musician.image " />
          <ion-img 
            *ngIf="musician.image"
            [src]="'data:image/jpeg;base64,' + musician.image ">
          </ion-img>   
          <ion-icon *ngIf="!musician.image" name="person-circle-outline"></ion-icon>           
        </ion-avatar>
        <ion-label class="initcap">
          {{ musician.name | lowercase }} {{ musician.surname | lowercase }}
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
    .musician-ion-item {    
      --min-height: 35px !important;       
      --inner-padding-end: 5px;
      //--padding-start:0px 
    }
    .initcap {
     text-transform: capitalize;
    }
  `]
})
export class MusicianSelectorComponent {
  @Input() musicians: Musician[] = [];
  @Output() musicianSelected = new EventEmitter<Musician>();

  constructor(private popoverController: PopoverController) {}

  selectMusician(musician: Musician) {         
    this.popoverController.dismiss(musician); 
  }
}
