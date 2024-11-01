import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MenuPartiturePageRoutingModule } from './menu-partiture-routing.module';
import { MenuPartiturePage } from './menu-partiture.page';
import { PartitureGroupState } from '../state/partiture-group/partiture-group.state';
import { NgxsModule } from '@ngxs/store';
import { PartitureGroupService } from '../services/partiture-group/partiture-group.service';
import { ModalPartitureGroupComponent } from './components/modal-partiture-group/modal-partiture-group.component';
import { PartitureState } from '../state/partiture/partiture.state';
import { PartitureService } from '../services/partiture/partiture.service';
import { ModalRequestPartitureComponent } from './components/modal-request-partiture/modal-request-partiture.component';
import { UserPartitureRequestState } from '../state/user-partiture-request/user-partiture-request.state';
import { UserPartitureRequestService } from '../services/user-partiture-request/user-partiture-request.service';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuPartiturePageRoutingModule,
    NgxsModule.forFeature([PartitureGroupState]),
    NgxsModule.forFeature([UserPartitureRequestState]),
    NgxsModule.forFeature([PartitureState])
  ],
  declarations: [MenuPartiturePage, ModalPartitureGroupComponent, ModalRequestPartitureComponent],
  providers:[
    PartitureGroupService,
    PartitureService,
    UserPartitureRequestService
  ]
})
export class MenuPartiturePageModule {}
