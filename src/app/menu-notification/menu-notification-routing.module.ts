import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MenuNotificationPage } from './menu-notification.page';

const routes: Routes = [
  {
    path: '',
    component: MenuNotificationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuNotificationPageRoutingModule {}
