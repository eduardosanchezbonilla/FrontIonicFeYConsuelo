import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsSuperAdminPage } from './tabs-super-admin.page';

const routes: Routes = [
  {
    path: '',
    component: TabsSuperAdminPage,
    children: [
      {
        path: 'menu-profile',       
        loadChildren: () => import('../menu-profile/menu-profile.module').then(m => m.MenuProfilePageModule)
      },
      {
        path: 'menu-user',        
        loadChildren: () => import('../menu-user/menu-user.module').then(m => m.MenuUserPageModule)
      },  
      {
        path: 'menu-musician',        
        loadChildren: () => import('../menu-musician/menu-musician.module').then(m => m.MenuMusicianPageModule)
      },
      {
        path: 'menu-partiture',        
        loadChildren: () => import('../menu-partiture/menu-partiture.module').then(m => m.MenuPartiturePageModule)
      },      
      {
        path: 'menu-contract',        
        loadChildren: () => import('../menu-contract/menu-contract.module').then(m => m.MenuContractPageModule)
      },     
      {
        path: 'menu-inventory',        
        loadChildren: () => import('../menu-inventory/menu-inventory.module').then(m => m.MenuInventoryPageModule)
      },      
      {
        path: 'menu-notification',        
        loadChildren: () => import('../menu-notification/menu-notification.module').then(m => m.MenuNotificationPageModule)
      },      
      {
        path: 'menu-multimedia',        
        loadChildren: () => import('../menu-multimedia/menu-multimedia.module').then(m => m.MenuMultimediaPageModule)
      },
      {
        path: 'menu-today-performance',        
        loadChildren: () => import('../menu-event/menu-event.module').then( m => m.MenuEventPageModule)        
      },
      {
        path: 'menu-event',
        loadChildren: () => import('../menu-event/menu-event.module').then( m => m.MenuEventPageModule)
      },
      {
        path: 'menu-history',
        loadChildren: () => import('../menu-history/menu-history.module').then( m => m.MenuHistoryPageModule)
      },
      {
        path: 'menu-contact',
        loadChildren: () => import('../menu-contact/menu-contact.module').then( m => m.MenuContactPageModule)
      },
      {
        path: 'menu-survey',
        loadChildren: () => import('../menu-survey/menu-survey.module').then( m => m.MenuSurveyPageModule)
      },
      {
        path: 'menu-repertoire',
        loadChildren: () => import('../menu-repertoire/menu-repertoire.module').then( m => m.MenuRepertoirePageModule)
      },
      {
        path: 'menu-suggestion-box',
        loadChildren: () => import('../menu-suggestion-box/menu-suggestion-box.module').then( m => m.MenuSuggestionBoxPageModule)
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
