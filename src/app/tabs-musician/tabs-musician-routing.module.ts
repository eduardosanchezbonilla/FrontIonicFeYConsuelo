import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsMusicianPage } from './tabs-musician.page';

const routes: Routes = [
  {
    path: '',
    component: TabsMusicianPage,
    children: [
      {
        path: 'menu-partiture',        
        loadChildren: () => import('../menu-partiture/menu-partiture.module').then(m => m.MenuPartiturePageModule)
      },      
      {
        path: 'menu-multimedia',        
        loadChildren: () => import('../menu-multimedia/menu-multimedia.module').then(m => m.MenuMultimediaPageModule)
      },
      {
        path: '',
        redirectTo: '/tabs-musician/menu-partiture',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs-musician/menu-partiture',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsMusicianPageRoutingModule {}
