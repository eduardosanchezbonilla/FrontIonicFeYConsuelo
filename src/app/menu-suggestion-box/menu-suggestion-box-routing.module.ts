import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MenuSuggestionBoxPage } from './menu-suggestion-box.page';

const routes: Routes = [
  {
    path: '',
    component: MenuSuggestionBoxPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuSuggestionBoxPageRoutingModule {}
