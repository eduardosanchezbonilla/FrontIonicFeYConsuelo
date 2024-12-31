import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MenuHistoryPage } from './menu-history.page';

const routes: Routes = [
  {
    path: '',
    component: MenuHistoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuHistoryPageRoutingModule {}
