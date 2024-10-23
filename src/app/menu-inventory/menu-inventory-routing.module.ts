import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MenuInventoryPage } from './menu-inventory.page';

const routes: Routes = [
  {
    path: '',
    component: MenuInventoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuInventoryPageRoutingModule {}
