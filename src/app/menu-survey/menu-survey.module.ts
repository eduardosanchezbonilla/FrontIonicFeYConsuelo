import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MenuSurveyPageRoutingModule } from './menu-survey-routing.module';

import { MenuSurveyPage } from './menu-survey.page';
import { NgxsModule } from '@ngxs/store';
import { SurveyState } from '../state/survey/survey.state';
import { SurveyService } from '../services/survey/survey.service';
import { ModalSurveyComponent } from './components/modal-survey/modal-survey.component';
import { ModalVoteSurveyComponent } from './components/modal-vote-survey/modal-vote-survey.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuSurveyPageRoutingModule,
    NgxsModule.forFeature([SurveyState])
  ],
  declarations: [
    MenuSurveyPage,
    ModalSurveyComponent,
    ModalVoteSurveyComponent
  ],
  providers:[
    SurveyService
  ]
})
export class MenuSurveyPageModule {}
