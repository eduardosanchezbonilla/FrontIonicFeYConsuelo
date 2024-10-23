import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MenuPartiturePage } from './menu-partiture.page';

const routes: Routes = [
  {
    path: '',
    component: MenuPartiturePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuPartiturePageRoutingModule {}
