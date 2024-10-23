import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsSuperAdminPage } from './tabs-super-admin.page';

const routes: Routes = [
  {
    path: '',
    component: TabsSuperAdminPage,
    children: [
      {
        path: 'menu-musician',        
        loadChildren: () => import('../menu-musician/menu-musician.module').then(m => m.MenuMusicianPageModule)
      },
      {
        path: 'menu-partiture',        
        loadChildren: () => import('../menu-partiture/menu-partiture.module').then(m => m.MenuPartiturePageModule)
      },      
      {
        path: 'menu-inventory',        
        loadChildren: () => import('../menu-inventory/menu-inventory.module').then(m => m.MenuInventoryPageModule)
      },
      {
        path: '',
        redirectTo: '/tabs-super-admin/menu-musician',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs-super-admin/menu-musician',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsSuperAdminPageRoutingModule {}
