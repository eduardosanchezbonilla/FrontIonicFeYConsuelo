import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MenuContactPage } from './menu-contact.page';

const routes: Routes = [
  {
    path: '',
    component: MenuContactPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuContactPageRoutingModule {}
