import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabsGuestPageRoutingModule } from './tabs-guest-routing.module';

import { TabsGuestPage } from './tabs-guest.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabsGuestPageRoutingModule
  ],
  declarations: [TabsGuestPage]
})
export class TabsGuestPageModule {}
