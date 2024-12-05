import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MenuEventPage } from './menu-event.page';

const routes: Routes = [
  {
    path: '',
    component: MenuEventPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuEventPageRoutingModule {}
