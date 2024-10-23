import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { PartitureGroup } from '../../../models/partiture-group/partiture-group';
import { ModalController } from '@ionic/angular';
import { Store } from '@ngxs/store';
import { LoadingService } from 'src/app/services/loading/loading.service';

@Component({
  selector: 'app-modal-partiture-group',
  templateUrl: './modal-partiture-group.component.html',
  styleUrls: ['./modal-partiture-group.component.scss'],
})
export class ModalPartitureGroupComponent implements OnInit {
  
  @Input() partitureGroup: PartitureGroup;
  @Input() updating: boolean;
  
  constructor(    
    private store:Store,
    private modalController: ModalController,
    private loadingService: LoadingService
  ) { }

  async ngOnInit() {    
    if(!this.partitureGroup){
      this.partitureGroup = new PartitureGroup();            
    }        
  }

  async ionViewDidEnter(){
    await this.loadingService.dismissLoading();          
  }

  confirm(){    
    this.modalController.dismiss(this.partitureGroup, 'confirm');
  }

  cancel(){
    this.modalController.dismiss(null, 'cancel');
  }

  inputUpperCase(event: any, element: any) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase(); 
    element = input.value; 
  }

}
