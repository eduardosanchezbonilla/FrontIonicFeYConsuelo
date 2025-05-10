import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MenuSurveyPage } from './menu-survey.page';

const routes: Routes = [
  {
    path: '',
    component: MenuSurveyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuSurveyPageRoutingModule {}
