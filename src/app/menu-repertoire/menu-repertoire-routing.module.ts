import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MenuRepertoirePage } from './menu-repertoire.page';

const routes: Routes = [
  {
    path: '',
    component: MenuRepertoirePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuRepertoirePageRoutingModule {}
