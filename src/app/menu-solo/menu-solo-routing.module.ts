import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MenuSoloPage } from './menu-solo.page';

const routes: Routes = [
  {
    path: '',
    component: MenuSoloPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuSoloPageRoutingModule {}
