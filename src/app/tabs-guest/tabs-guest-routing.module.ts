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
        path: 'menu-history',
        loadChildren: () => import('../menu-history/menu-history.module').then( m => m.MenuHistoryPageModule)
      },
      {
        path: 'menu-repertoire',
        loadChildren: () => import('../menu-repertoire/menu-repertoire.module').then( m => m.MenuRepertoirePageModule)
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
