import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './services/authguard/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./users/users.module').then(m => m.UsersModule)
  },
  {
    path: 'tabs-super-admin',
    loadChildren: () => import('./tabs-super-admin/tabs-super-admin.module').then( m => m.TabsSuperAdminPageModule)
  },
  {
    path: 'tabs-admin',
    loadChildren: () => import('./tabs-admin/tabs-admin.module').then( m => m.TabsAdminPageModule),
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'always', // Esto evita el caché
  },
  {
    path: 'tabs-musician',
    loadChildren: () => import('./tabs-musician/tabs-musician.module').then( m => m.TabsMusicianPageModule),
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'always', // Esto evita el caché
  },
  {
    path: 'tabs-guest',
    loadChildren: () => import('./tabs-guest/tabs-guest.module').then( m => m.TabsGuestPageModule),
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'always', // Esto evita el caché
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
