import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MenuMultimediaPage } from './menu-multimedia.page';

const routes: Routes = [
  {
    path: '',
    component: MenuMultimediaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuMultimediaPageRoutingModule {}
