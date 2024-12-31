import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MenuHistoryPageRoutingModule } from './menu-history-routing.module';

import { MenuHistoryPage } from './menu-history.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuHistoryPageRoutingModule
  ],
  declarations: [MenuHistoryPage]
})
export class MenuHistoryPageModule {}
