import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsGuestPage } from './tabs-guest.page';


const routes: Routes = [
  {
    path: '',
    component: TabsGuestPage,
    children: [
      {
        path: 'menu-multimedia',        
        loadChildren: () => import('../menu-multimedia/menu-multimedia.module').then(m => m.MenuMultimediaPageModule)
      },
      {
        path: '',
        redirectTo: '/tabs-guest/menu-multimedia',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs-guest/menu-multimedia',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsGuestPageRoutingModule {}
