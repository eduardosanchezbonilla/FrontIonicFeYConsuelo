import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MenuContactPageRoutingModule } from './menu-contact-routing.module';

import { MenuContactPage } from './menu-contact.page';
import { NgxsModule } from '@ngxs/store';
import { ContactState } from '../state/contact/contact.state';
import { ContactService } from '../services/contact/contact.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuContactPageRoutingModule,
    NgxsModule.forFeature([ContactState]),
  ],
  declarations: [MenuContactPage],
  providers:[
    ContactService
  ]
})
export class MenuContactPageModule {}
