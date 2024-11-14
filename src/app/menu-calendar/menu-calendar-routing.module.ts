import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MenuCalendarPage } from './menu-calendar.page';

const routes: Routes = [
  {
    path: '',
    component: MenuCalendarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuCalendarPageRoutingModule {}
