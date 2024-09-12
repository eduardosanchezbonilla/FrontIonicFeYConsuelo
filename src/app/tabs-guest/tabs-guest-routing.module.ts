import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsGuestPage } from './tabs-guest.page';


const routes: Routes = [
  {
    path: '',
    component: TabsGuestPage,
    children: [
      {
        path: 'tab1',
        loadChildren: () => import('../tab1/tab1.module').then(m => m.Tab1PageModule)
      },
      {
        path: '',
        redirectTo: '/tabs-guest/tab1',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs-guest/tab1',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsGuestPageRoutingModule {}
