import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsMusicianPage } from './tabs-musician.page';

const routes: Routes = [
  {
    path: '',
    component: TabsMusicianPage,
    children: [
      {
        path: 'menu-musician',      
        loadChildren: () => import('../menu-musician/menu-musician.module').then(m => m.MenuMusicianPageModule)
      },
      {
        path: 'tab2',
        loadChildren: () => import('../tab2/tab2.module').then(m => m.Tab2PageModule)
      },
      {
        path: '',
        redirectTo: '/tabs-musician/menu-musician',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs-musician/menu-musician',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsMusicianPageRoutingModule {}
