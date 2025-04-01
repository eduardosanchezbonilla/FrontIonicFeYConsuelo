import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MenuContractPage } from './menu-contract.page';

const routes: Routes = [
  {
    path: '',
    component: MenuContractPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuContractPageRoutingModule {}
