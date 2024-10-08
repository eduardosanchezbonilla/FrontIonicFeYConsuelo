import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabsSuperAdminPageRoutingModule } from './tabs-super-admin-routing.module';

import { TabsSuperAdminPage } from './tabs-super-admin.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabsSuperAdminPageRoutingModule
  ],
  declarations: [TabsSuperAdminPage]
})
export class TabsSuperAdminPageModule {}
