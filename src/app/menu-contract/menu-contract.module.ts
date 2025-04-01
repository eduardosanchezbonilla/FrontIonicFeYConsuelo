import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MenuContractPageRoutingModule } from './menu-contract-routing.module';

import { MenuContractPage } from './menu-contract.page';
import { NgxsModule } from '@ngxs/store';
import { ContractGroupState } from '../state/contract-group/contract-group.state';
import { ContractState } from '../state/contract/contract.state';
import { ContractGroupService } from '../services/contract-group/contract-group.service';
import { ContractService } from '../services/contract/contract.service';
import { ModalContractGroupComponent } from './components/modal-contract-group/modal-contract-group.component';
import { ModalContractComponent } from './components/modal-contract/modal-contract.component';

@NgModule({
  imports: [
    CommonModule,
        FormsModule,
        IonicModule,
        MenuContractPageRoutingModule,
        NgxsModule.forFeature([ContractGroupState]),        
        NgxsModule.forFeature([ContractState])
  ],
  declarations: [MenuContractPage, ModalContractGroupComponent, ModalContractComponent],
  providers:[
    ContractGroupService,
    ContractService
  ]
})
export class MenuContractPageModule {}
