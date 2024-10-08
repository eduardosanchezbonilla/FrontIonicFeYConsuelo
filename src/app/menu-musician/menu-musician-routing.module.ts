import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MenuMusicianPage } from './menu-musician.page';

const routes: Routes = [
  {
    path: '',
    component: MenuMusicianPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuMusicianPageRoutingModule {}
