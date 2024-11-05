import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MenuNotificationPageRoutingModule } from './menu-notification-routing.module';

import { MenuNotificationPage } from './menu-notification.page';
import { NotificationState } from '../state/notification/notification.state';
import { NgxsModule } from '@ngxs/store';
import { NotificationService } from '../services/notification/notification.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuNotificationPageRoutingModule,
    NgxsModule.forFeature([NotificationState]),
  ],
  declarations: [MenuNotificationPage],
  providers:[
    NotificationService
  ]
})
export class MenuNotificationPageModule {}
