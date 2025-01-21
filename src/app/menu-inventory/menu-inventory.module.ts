import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MenuInventoryPageRoutingModule } from './menu-inventory-routing.module';
import { MenuInventoryPage } from './menu-inventory.page';
import { NgxsModule } from '@ngxs/store';
import { InventoryState } from '../state/inventory/inventory.state';
import { InventoryService } from '../services/inventory/inventory';
import { ModalInventoryComponent } from './components/modal-inventory/modal-inventory.component';
import { MusicianInventoryState } from '../state/musician-inventory/musician-inventory.state';
import { MusicianInventoryService } from '../services/musician-inventory/musician-inventory.service';
import { CameraService } from '../services/camera/camera.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuInventoryPageRoutingModule,
    NgxsModule.forFeature([InventoryState]),
    NgxsModule.forFeature([MusicianInventoryState])
  ],
  declarations: [MenuInventoryPage, ModalInventoryComponent],  
  providers:[
    InventoryService,
    MusicianInventoryService,
    CameraService
  ]
})
export class MenuInventoryPageModule {}
