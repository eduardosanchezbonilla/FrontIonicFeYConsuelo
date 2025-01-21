import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabsMusicianPageRoutingModule } from './tabs-musician-routing.module';

import { TabsMusicianPage } from './tabs-musician.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabsMusicianPageRoutingModule
  ],
  declarations: [TabsMusicianPage]
})
export class TabsMusicianPageModule {
}
