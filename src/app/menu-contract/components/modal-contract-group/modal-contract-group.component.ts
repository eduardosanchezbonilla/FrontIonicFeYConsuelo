import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ContractGroup } from 'src/app/models/contract-group/contract-group';
import { LoadingService } from 'src/app/services/loading/loading.service';

@Component({
  selector: 'app-modal-contract-group',
  templateUrl: './modal-contract-group.component.html',
  styleUrls: ['./modal-contract-group.component.scss'],
})
export class ModalContractGroupComponent implements OnInit {
  
  @Input() contractGroup: ContractGroup;
  @Input() updating: boolean;
  
  constructor(    
  
    private modalController: ModalController,
    private loadingService: LoadingService
  ) { }

  async ngOnInit() {    
    if(!this.contractGroup){
      this.contractGroup = new ContractGroup();            
    }        
  }

  async ionViewDidEnter(){
    await this.loadingService.dismissLoading();          
  }

  confirm(){    
    this.modalController.dismiss(this.contractGroup, 'confirm');
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
